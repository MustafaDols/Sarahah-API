

export const fileTypes = {
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "audio",
    APPLICATION: "application"
}


export const allowedFileExtensions = {
    [fileTypes.IMAGE]: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
    [fileTypes.VIDEO]: ['mp4', 'avi', 'mkv', 'mov', 'wmv'],
    [fileTypes.AUDIO]: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
    [fileTypes.APPLICATION]: ['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx', 'zip', 'rar']

}