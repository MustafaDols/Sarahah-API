import { v2 as cloudinaryV2 } from "cloudinary";

cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const UploadFileOnCloudinary = async (file, options) => {
    const result = await cloudinaryV2.uploader.upload(file, options);
    return result
}

export const UploadMultipleFilesOnCloudinary = async (files, options) => {
    for (const file of files) {
        const { secure_url, public_id } = await UploadFileOnCloudinary(file, options)
        result.push({ secure_url, public_id })
    }
    return result
}


export const DeleteFileCloudinary = async (public_id) => {
    const result = await cloudinaryV2.uploader.destroy(public_id);
    return result;
}

export const DeleteManyFilesUsingPublicIds = async (public_ids) => {
    const result = await cloudinaryV2.api.delete_resources(public_ids);
    return result
} 


export const CleanUpFolderFromCloudinary = async (folder_name) => {
    const result = await cloudinaryV2.api.delete_resources_by_prefix(folder_name);
    return result
}


export const DeleteFolderFromCloudinary = async (folder_name) => {
    await CleanUpFolderFromCloudinary(folder_name)
    const result = await cloudinaryV2.api.delete_folder(folder_name);
    return result
} 