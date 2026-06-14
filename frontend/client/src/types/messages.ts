interface MessageBadge {
    uuid: string;
    type: MessageBadgeTypes;
    message: string;
}

enum MessageBadgeTypes {
    SUCCESS = "success",
    INFO = "info",
    WARNING = "warning",
    ERROR = "error"
}

export { MessageBadge, MessageBadgeTypes }