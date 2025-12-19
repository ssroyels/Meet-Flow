export interface GeneratedAvatarProps {
  seed?: string;        // input like "xyz", email, id
  size?: number;
  className?: string;
}

export const GeneratedAvatar = ({
  seed = "user",
  size = 40,
  className = "",
}: GeneratedAvatarProps) => {
  // Normalize seed so XYZ, xyz, " xyz " same avatar de
  const normalizedSeed =
    seed.trim().toLowerCase() || "user";

  // DiceBear bot avatar URL
  const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(
    normalizedSeed
  )}`;

  return (
    <img
      src={avatarUrl}
      alt={normalizedSeed}
      width={size}
      height={size}
      className={className}
    />
  );
};
