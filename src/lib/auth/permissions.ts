type UploadViewer = {
  user: { accountType: "student" | "teacher" };
  isAdmin: boolean;
};

/** Only teacher accounts and allowlisted Merit admins may upload hosted videos. */
export function canUploadVideos(viewer: UploadViewer | null | undefined) {
  return Boolean(viewer && (viewer.isAdmin || viewer.user.accountType === "teacher"));
}
