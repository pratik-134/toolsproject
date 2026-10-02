import React from "react";
import { Globe } from "lucide-react";

interface CountryFlagIconProps {
  countryCode: string;
  className?: string;
  size?: number;
}

export const CountryFlagIcon: React.FC<CountryFlagIconProps> = ({
  countryCode,
  className = "w-5 h-3.5 rounded-xs object-cover shadow-2xs inline-block shrink-0 border border-slate-200 dark:border-slate-700",
}) => {
  const code = countryCode.toLowerCase();

  switch (code) {
    case "utc":
      return <Globe className="w-4 h-4 text-blue-500 inline-block shrink-0" />;

    case "gb":
    case "london":
      // UK Union Jack
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="United Kingdom Flag">
          <clipPath id="uk-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#uk-clip)">
            <rect width="60" height="36" fill="#012169" />
            <path d="M0 0 L60 36 M60 0 L0 36" stroke="#fff" strokeWidth="6" />
            <path d="M0 0 L60 36 M60 0 L0 36" stroke="#C8102E" strokeWidth="3" />
            <path d="M30 0 v36 M0 18 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30 0 v36 M0 18 h60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      );

    case "us":
    case "newyork":
    case "sanfrancisco":
      // US Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="United States Flag">
          <clipPath id="us-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#us-clip)">
            <rect width="60" height="36" fill="#B22234" />
            <path d="M0 5.5 h60 M0 11 h60 M0 16.5 h60 M0 22 h60 M0 27.5 h60 M0 33 h60" stroke="#fff" strokeWidth="2.8" />
            <rect width="25" height="19.5" fill="#3C3B6E" />
            <circle cx="5" cy="5" r="1.2" fill="#fff" />
            <circle cx="12.5" cy="5" r="1.2" fill="#fff" />
            <circle cx="20" cy="5" r="1.2" fill="#fff" />
            <circle cx="8.75" cy="10" r="1.2" fill="#fff" />
            <circle cx="16.25" cy="10" r="1.2" fill="#fff" />
            <circle cx="5" cy="15" r="1.2" fill="#fff" />
            <circle cx="12.5" cy="15" r="1.2" fill="#fff" />
            <circle cx="20" cy="15" r="1.2" fill="#fff" />
          </g>
        </svg>
      );

    case "jp":
    case "tokyo":
      // Japan Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="Japan Flag">
          <rect width="60" height="36" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx="30" cy="18" r="10" fill="#bc002d" />
        </svg>
      );

    case "au":
    case "sydney":
      // Australia Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="Australia Flag">
          <clipPath id="au-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#au-clip)">
            <rect width="60" height="36" fill="#00008B" />
            {/* Small canton Union Jack */}
            <g transform="scale(0.5)">
              <rect width="60" height="36" fill="#012169" />
              <path d="M0 0 L60 36 M60 0 L0 36" stroke="#fff" strokeWidth="6" />
              <path d="M0 0 L60 36 M60 0 L0 36" stroke="#C8102E" strokeWidth="3" />
              <path d="M30 0 v36 M0 18 h60" stroke="#fff" strokeWidth="10" />
              <path d="M30 0 v36 M0 18 h60" stroke="#C8102E" strokeWidth="6" />
            </g>
            {/* Southern Cross stars */}
            <circle cx="45" cy="8" r="1.5" fill="#fff" />
            <circle cx="52" cy="14" r="1.5" fill="#fff" />
            <circle cx="51" cy="24" r="1.5" fill="#fff" />
            <circle cx="43" cy="27" r="1.5" fill="#fff" />
            <circle cx="48" cy="18" r="1" fill="#fff" />
            {/* Commonwealth star */}
            <circle cx="15" cy="26" r="3" fill="#fff" />
          </g>
        </svg>
      );

    case "fr":
    case "paris":
      // France Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="France Flag">
          <clipPath id="fr-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#fr-clip)">
            <rect width="20" height="36" fill="#002395" />
            <rect x="20" width="20" height="36" fill="#ffffff" />
            <rect x="40" width="20" height="36" fill="#ED2939" />
          </g>
        </svg>
      );

    case "de":
    case "berlin":
      // Germany Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="Germany Flag">
          <clipPath id="de-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#de-clip)">
            <rect width="60" height="12" fill="#000000" />
            <rect y="12" width="60" height="12" fill="#DD0000" />
            <rect y="24" width="60" height="12" fill="#FFCC00" />
          </g>
        </svg>
      );

    case "in":
    case "newdelhi":
      // India Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="India Flag">
          <clipPath id="in-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#in-clip)">
            <rect width="60" height="12" fill="#FF9933" />
            <rect y="12" width="60" height="12" fill="#FFFFFF" />
            <rect y="24" width="60" height="12" fill="#138808" />
            <circle cx="30" cy="18" r="4.5" stroke="#000080" strokeWidth="0.8" fill="none" />
            <circle cx="30" cy="18" r="1.2" fill="#000080" />
          </g>
        </svg>
      );

    case "ae":
    case "dubai":
      // UAE Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="UAE Flag">
          <clipPath id="ae-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#ae-clip)">
            <rect x="15" width="45" height="12" fill="#00732F" />
            <rect x="15" y="12" width="45" height="12" fill="#FFFFFF" />
            <rect x="15" y="24" width="45" height="12" fill="#000000" />
            <rect width="15" height="36" fill="#FF0000" />
          </g>
        </svg>
      );

    case "sg":
    case "singapore":
      // Singapore Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="Singapore Flag">
          <clipPath id="sg-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#sg-clip)">
            <rect width="60" height="18" fill="#ED2939" />
            <rect y="18" width="60" height="18" fill="#FFFFFF" />
            <circle cx="12" cy="9" r="5" fill="#FFFFFF" />
            <circle cx="14" cy="9" r="4.5" fill="#ED2939" />
          </g>
        </svg>
      );

    case "hk":
    case "hongkong":
      // Hong Kong Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="Hong Kong Flag">
          <rect width="60" height="36" rx="2" fill="#DE2910" />
          <circle cx="30" cy="18" r="6" fill="#fff" />
          <circle cx="30" cy="18" r="3" fill="#DE2910" />
        </svg>
      );

    case "ca":
    case "toronto":
      // Canada Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="Canada Flag">
          <clipPath id="ca-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#ca-clip)">
            <rect width="15" height="36" fill="#FF0000" />
            <rect x="15" width="30" height="36" fill="#FFFFFF" />
            <rect x="45" width="15" height="36" fill="#FF0000" />
            {/* Maple leaf silhouette */}
            <path d="M30 10 L33 16 L37 15 L35 19 L39 21 L34 23 L31 22 L31 26 L29 26 L29 22 L26 23 L21 21 L25 19 L23 15 L27 16 Z" fill="#FF0000" />
          </g>
        </svg>
      );

    case "br":
    case "saopaulo":
      // Brazil Flag
      return (
        <svg viewBox="0 0 60 36" className={className} aria-label="Brazil Flag">
          <clipPath id="br-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#br-clip)">
            <rect width="60" height="36" fill="#009C3B" />
            <polygon points="30,4 54,18 30,32 6,18" fill="#FFDF00" />
            <circle cx="30" cy="18" r="7" fill="#002776" />
          </g>
        </svg>
      );

    default:
      return <Globe className="w-4 h-4 text-slate-400 inline-block shrink-0" />;
  }
};
