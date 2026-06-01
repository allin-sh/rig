use std::collections::HashSet;

use super::models::{
    BucketType, Skill, SkillListingError, SkillRoot, SkillRootDefinition, SkillRootImportError,
    SkillRootKind, SkillUsage, SkillUsageError, SkillUsageSeries, WindowType,
};
use super::root_store::{
    import_skill_root_from_path, list_imported_skill_roots, remove_imported_skill_root,
};
use super::scanner::list_skills_from_root;
use super::usage::{list_skill_usage_tendencies_from_log, list_skill_usages_from_log};
use crate::skills::fs::expand_path;
use crate::skills::models::SkillListingErrorCode;

const SKILL_USAGE_LOG_PATH: &str = "~/.rig/usage.jsonl";

pub const SKILL_ROOT_DEFINITIONS: &[SkillRootDefinition] = &[
    SkillRootDefinition {
        id: "agents-global",
        path: "~/.agents/skills",
        label: "Agents Global Skills",
    },
    SkillRootDefinition {
        id: "opencode-global",
        path: "~/.config/opencode/skills",
        label: "OpenCode Global Skills",
    },
    SkillRootDefinition {
        id: "claude-global",
        path: "~/.claude/skills",
        label: "Claude Global Skills",
    },
];

#[tauri::command]
pub fn list_skill_roots(app: tauri::AppHandle) -> Vec<SkillRoot> {
    let mut roots = SKILL_ROOT_DEFINITIONS
        .iter()
        .map(|definition| {
            let path = expand_path(definition.path);

            SkillRoot {
                id: definition.id.to_string(),
                path: path.to_string_lossy().to_string(),
                label: definition.label.to_string(),
                exists: path.exists(),
                kind: SkillRootKind::Default,
            }
        })
        .collect::<Vec<_>>();

    roots.extend(list_imported_skill_roots(&app));
    roots
}

#[tauri::command]
pub fn import_skill_root(
    app: tauri::AppHandle,
    path: String,
) -> Result<SkillRoot, SkillRootImportError> {
    import_skill_root_from_path(&app, expand_path(path.as_str()))
}

#[tauri::command]
pub fn remove_skill_root(
    app: tauri::AppHandle,
    root_id: String,
) -> Result<(), SkillRootImportError> {
    remove_imported_skill_root(&app, root_id)
}

#[tauri::command]
pub fn list_skills(root_path: String) -> Result<Vec<Skill>, SkillListingError> {
    let path = expand_path(root_path.as_str());

    if !path.exists() {
        return Err(SkillListingError {
            code: SkillListingErrorCode::PathNotFound,
            message: format!("Skill root path does not exist: {}", root_path),
        });
    }

    if !path.is_dir() {
        return Err(SkillListingError {
            code: SkillListingErrorCode::NotDirectory,
            message: format!("Skill root path is not a directory: {}", root_path),
        });
    }

    return list_skills_from_root(&path);
}

#[tauri::command]
pub fn list_skills_from_roots(root_paths: Vec<String>) -> Result<Vec<Skill>, SkillListingError> {
    let mut seen_skill_names = HashSet::new();
    let mut skills = Vec::new();

    for root_path in root_paths {
        let root_skills = match list_skills(root_path) {
            Ok(root_skills) => root_skills,
            Err(error)
                if matches!(
                    error.code,
                    SkillListingErrorCode::PathNotFound | SkillListingErrorCode::NotDirectory
                ) =>
            {
                continue;
            }
            Err(error) => return Err(error),
        };

        for skill in root_skills {
            if seen_skill_names.insert(skill.name.clone()) {
                skills.push(skill);
            }
        }
    }

    Ok(skills)
}

#[tauri::command]
pub fn list_skill_usages(window: Option<WindowType>) -> Result<Vec<SkillUsage>, SkillUsageError> {
    let path = expand_path(SKILL_USAGE_LOG_PATH);

    list_skill_usages_from_log(&path, window.unwrap_or(WindowType::Day))
}

#[tauri::command]
pub fn list_skill_usages_tendency(
    window: Option<WindowType>,
    bucket_type: Option<BucketType>,
) -> Result<Vec<SkillUsageSeries>, SkillUsageError> {
    let path = expand_path(SKILL_USAGE_LOG_PATH);

    list_skill_usage_tendencies_from_log(
        &path,
        window.unwrap_or(WindowType::Week),
        bucket_type.unwrap_or(BucketType::Hour),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn list_skills_from_roots_keeps_first_duplicate_skill_name() {
        let temp_root = std::env::temp_dir().join(format!(
            "rig-skills-test-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let first_root = temp_root.join("first");
        let second_root = temp_root.join("second");

        write_skill(&first_root, "shared", "Shared Skill");
        write_skill(&second_root, "shared", "Shared Skill");
        write_skill(&second_root, "unique", "Unique Skill");

        let skills = list_skills_from_roots(vec![
            first_root.to_string_lossy().to_string(),
            second_root.to_string_lossy().to_string(),
        ])
        .unwrap();

        let skill_names = skills
            .iter()
            .map(|skill| skill.name.as_str())
            .collect::<Vec<_>>();
        let shared_skill = skills
            .iter()
            .find(|skill| skill.name == "Shared Skill")
            .unwrap();

        assert_eq!(skill_names.len(), 2);
        assert!(skill_names.contains(&"Shared Skill"));
        assert!(skill_names.contains(&"Unique Skill"));
        assert_eq!(shared_skill.root_path, first_root.to_string_lossy());

        fs::remove_dir_all(temp_root).ok();
    }

    fn write_skill(root: &std::path::Path, relative_path: &str, name: &str) {
        let skill_dir = root.join(relative_path);

        fs::create_dir_all(&skill_dir).unwrap();
        fs::write(
            skill_dir.join("SKILL.md"),
            format!(
                "---\nname: {}\ndescription: Test skill\n---\nUse this skill for testing.",
                name
            ),
        )
        .unwrap();
    }
}
