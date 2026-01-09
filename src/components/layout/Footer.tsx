import Link from "next/link";
import { getBackgroundColor } from "@/utils/get-backgrounColor";
import { LinkProps } from "@/types";

interface FooterProps {
  data: {
    backgroundColor: "white" | "black" | "green" | "red";
    logoText: string;
    text: string;
    copy: string;
    socialLinks: LinkProps[];
  };
}

export function Footer({ data }: Readonly<FooterProps>) {
  if (!data) return null;

  const { backgroundColor, logoText, text, copy, socialLinks } = data;

    const textColor = backgroundColor === "black" ? "text-white" : "text-neutral-900";

    const subTextColor = backgroundColor === "black" ? "text-neutral-400" : "text-neutral-600";

    const hoverColor = backgroundColor === "black" ? "hover:text-lime-400" : "hover:text-lime-600";

  

      return (

  

        <footer

  

          className={`section py-6 sm:py-8 ${getBackgroundColor(

  

            backgroundColor

  

          )} justify-center items-center text-center`}

  

        >

  

          <div className="wrapper flex-col justify-center items-center gap-4">

  

            {/* Logo & Description */}

  

            <div className="flex flex-col items-center gap-1">

  

              <h2 className={`h2 ${textColor}`}>{logoText}</h2>

  

              <p className={`subtitle ${subTextColor} max-w-md text-sm`}>{text}</p>

  

            </div>

  

    

  

            {/* Social Links */}

  

            <div className="flex gap-4">

  

              {socialLinks.map((link) => (

  

                <Link

  

                  key={link.id}

  

                  href={link.href}

  

                  target={link.isExternal ? "_blank" : "_self"}

  

                  className={`${textColor} ${hoverColor} font-bold text-sm transition-colors`}

  

                >

  

                  {link.text}

  

                </Link>

  

              ))}

  

            </div>

  

    

  

            {/* Copyright */}

  

            <div className="w-full border-t border-neutral-800 mt-2 pt-4">

  

              <p className={`text-xs ${subTextColor}`}>{copy}</p>

  

            </div>

  

          </div>

  

        </footer>

  

      );

  

    }

  

    

  