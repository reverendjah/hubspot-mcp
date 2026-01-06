export enum MessageType {
  TEXT = "text",
  REACTION = "reaction",
  ACTION = "action",
  SYSTEM = "system",
  MEDIA = "media",
  INTERACTIVE = "interactive",
  TEMPLATE = "template",
}

export enum MessageStatus {
  QUEUED = "queued",
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
  DELETED = "deleted",
  WARNING = "warning",
  UPDATED = "updated",
}

export enum MessageDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
}

export enum ContentType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  FOOTER = "footer",
  HEADER = "header",
  CONTACT = "contact",
  LOCATION = "location",
  BUTTON = "button",
  LIST = "list",
  TEMPLATE = "template",
  STICKER = "sticker",
  REACTION = "reaction",
  REQUEST_LOCATION = "request_location",
}

export enum ButtonType {
  QUICK_REPLY = "quick_reply",
  CALL_TO_ACTION = "call_to_action",
  URL = "url",
  PHONE = "phone",
  POSTBACK = "postback",
}

export enum ListType {
  SINGLE_SELECT = "single_select",
  MULTI_SELECT = "multi_select",
}

export enum MediaFormat {
  // Images
  JPG = "jpg",
  JPEG = "jpeg",
  PNG = "png",
  WEBP = "webp",
  GIF = "gif",

  // Videos
  MP4 = "mp4",
  WEBM = "webm",
  AVI = "avi",
  MOV = "mov",
  "3GP" = "3gp",

  // Audio
  MP3 = "mp3",
  OGG = "ogg",
  AAC = "aac",
  WAV = "wav",
  OPUS = "opus",

  // Documents
  PDF = "pdf",
  DOC = "doc",
  DOCX = "docx",
  XLS = "xls",
  XLSX = "xlsx",
  PPT = "ppt",
  PPTX = "pptx",
  TXT = "txt",
}

export enum ConversationType {
  ONE_TO_ONE = "one_to_one",
  GROUP = "group",
}

export enum ConversationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
