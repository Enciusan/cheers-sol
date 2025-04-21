import { verifyAuth } from "@/api/serverAuth";
import { addOrChangeProfileImage } from "@/api/userFunctions"; // Ensure this import is correct
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({}) => {
      // This code runs on your server before upload
      const user = await verifyAuth();

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.wallet_address };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // // This code RUNS ON YOUR SERVER after upload

      const imageUrlToSave = file.ufsUrl;
      console.log("onUploadComplete: File URL to save:", imageUrlToSave);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
