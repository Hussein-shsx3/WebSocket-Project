import Image from "next/image";
import Link from "next/link";

interface ProfileHeaderProps {
  title: string;
  showEditButton?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  backgroundImage?: string;
}

const ProfileHeader = ({
  title,
  showEditButton = false,
  showCloseButton = false,
  onClose,
  backgroundImage = "/images/img-4.jpg",
}: ProfileHeaderProps) => {
  return (
    <div className="sticky top-0">
      <div className="w-full h-[165px] relative">
        <h5 className="absolute z-10 text-white top-4 left-4 font-medium">
          {title}
        </h5>

        {/* Edit Button */}
        {showEditButton && (
          <Link
            href={"/profile/edit-profile"}
            className="absolute z-10 top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Link>
        )}

        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute z-10 top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        <Image
          src={backgroundImage}
          fill
          alt="Profile Background"
          className="object-cover"
          sizes="100vw"
          loading="eager"
        />
        <span className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_130%)]"></span>
      </div>
    </div>
  );
};

export default ProfileHeader;
