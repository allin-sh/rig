use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;

use chrono::{DateTime, Duration, Utc};

use super::models::{
    SkillUsage, SkillUsageError, SkillUsageErrorCode, SkillUsageLogSchema, WindowType,
};

struct SkillUsageEvent {
    skill_name: String,
    used_at: DateTime<Utc>,
}

pub fn list_skill_usages_from_log(
    path: &Path,
    window: WindowType,
) -> Result<Vec<SkillUsage>, SkillUsageError> {
    let events = read_skill_usage_events(path)?;

    Ok(summarize_skill_usages(events, window, Utc::now()))
}

fn read_skill_usage_events(path: &Path) -> Result<Vec<SkillUsageEvent>, SkillUsageError> {
    if !path.exists() {
        return Ok(vec![]);
    }

    let file = File::open(path).map_err(|error| SkillUsageError {
        code: SkillUsageErrorCode::ReadFailed,
        message: format!("Failed to open skill usage log: {}", error),
    })?;

    let reader = BufReader::new(file);

    Ok(reader
        .lines()
        .filter_map(Result::ok)
        .filter_map(|line| parse_skill_usage_event(&line))
        .collect())
}

fn parse_skill_usage_event(line: &str) -> Option<SkillUsageEvent> {
    let line = line.trim();

    if line.is_empty() {
        return None;
    }

    let log = serde_json::from_str::<SkillUsageLogSchema>(line).ok()?;
    let used_at = DateTime::parse_from_rfc3339(&log.used_at)
        .ok()?
        .with_timezone(&Utc);

    Some(SkillUsageEvent {
        skill_name: log.skill_name,
        used_at,
    })
}

fn summarize_skill_usages(
    events: Vec<SkillUsageEvent>,
    window: WindowType,
    now: DateTime<Utc>,
) -> Vec<SkillUsage> {
    let start = usage_window_start(now, window);
    let mut usages = HashMap::<String, SkillUsage>::new();

    for event in events {
        if event.used_at < start || event.used_at > now {
            continue;
        }

        update_skill_usage(&mut usages, event);
    }

    let mut usages = usages.into_values().collect::<Vec<_>>();
    usages.sort_by(|a, b| a.name.cmp(&b.name));
    usages
}

fn update_skill_usage(usages: &mut HashMap<String, SkillUsage>, event: SkillUsageEvent) {
    let used_at = event
        .used_at
        .to_rfc3339_opts(chrono::SecondsFormat::Millis, true);

    let usage = usages
        .entry(event.skill_name.clone())
        .or_insert(SkillUsage {
            name: event.skill_name,
            count: 0,
            last_used_at: None,
        });

    usage.count += 1;

    if usage
        .last_used_at
        .as_ref()
        .map(|last_used_at| used_at > *last_used_at)
        .unwrap_or(true)
    {
        usage.last_used_at = Some(used_at);
    }
}

fn usage_window_start(now: DateTime<Utc>, window: WindowType) -> DateTime<Utc> {
    match window {
        WindowType::Day => now - Duration::hours(24),
        WindowType::Week => now - Duration::days(7),
        WindowType::Month => now - Duration::days(30),
        WindowType::Year => now - Duration::days(365),
    }
}
