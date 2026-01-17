use aisdk::integrations::vercel_aisdk_ui::VercelUIStream;

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase", tag = "event")]
pub enum StreamEvent {
    Chunk { data: VercelUIStream },
    Done,
    Error { message: String },
}
