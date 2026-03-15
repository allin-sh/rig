use super::{entities, Storage};

impl Storage {
    pub async fn get_all_agents(&self) -> Result<Vec<entities::Agent>, String> {
        match self.read::<entities::AgentsFile>(&["agent"]).await {
            Ok(file) => {
                if file.agents.is_empty() {
                    let agent = entities::Agent::default();
                    self.save_agents(&[agent.clone()]).await?;
                    Ok(vec![agent])
                } else {
                    Ok(file.agents)
                }
            }
            Err(e) if e.contains("Failed to parse JSON") => Err(e),
            Err(_) => {
                let agent = entities::Agent::default();
                self.save_agents(&[agent.clone()]).await?;
                Ok(vec![agent])
            }
        }
    }

    pub async fn get_agent(&self, id: &str) -> Result<entities::Agent, String> {
        let agents = self.get_all_agents().await?;
        agents
            .into_iter()
            .find(|a| a.id == id)
            .ok_or_else(|| format!("Agent not found: {}", id))
    }

    pub async fn create_agent(&self, agent: &entities::Agent) -> Result<(), String> {
        let mut agents = self.get_all_agents().await?;
        agents.push(agent.clone());
        self.save_agents(&agents).await
    }

    pub async fn update_agent(&self, agent: &entities::Agent) -> Result<(), String> {
        let mut agents = self.get_all_agents().await?;
        if let Some(existing) = agents.iter_mut().find(|a| a.id == agent.id) {
            *existing = agent.clone();
        } else {
            return Err(format!("Agent not found: {}", agent.id));
        }
        self.save_agents(&agents).await
    }

    pub async fn delete_agent(&self, id: &str) -> Result<(), String> {
        let agents = self.get_all_agents().await?;
        if agents.len() <= 1 {
            return Err("Cannot delete the last agent".to_string());
        }

        let filtered: Vec<_> = agents.into_iter().filter(|a| a.id != id).collect();
        self.save_agents(&filtered).await
    }

    async fn save_agents(&self, agents: &[entities::Agent]) -> Result<(), String> {
        let file = entities::AgentsFile {
            agents: agents.to_vec(),
        };
        self.write(&["agent"], &file).await
    }
}
