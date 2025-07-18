"use client";
import Link from "next/link";

import { useState } from "react";

import { StrapiImage } from "@/components/general/StrapiImage";
import { LinkProps, LogoProps } from "@/types";
import { getBackgroundColor } from "@/utils/get-backgrounColor";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface HeaderProps {
  data: {
    backgroundColor: "white" | "black" | "green" | "red";
    logo: LogoProps;
    navigation: LinkProps[];
    moreOptionIcon: LogoProps;
  };
}

export function Header({ data }: HeaderProps) {
  const [open, setOpen] = useState(false);

  if (!data) return null;

  const { backgroundColor, logo, navigation, moreOptionIcon } = data;

  return (
    <header
      className={`section sticky top-0 z-50 md:relative ${getBackgroundColor(
        backgroundColor
      )} justify-center items-center border-solid border-b-1 border-b-neutral-900`}
    >
      <div className="wrapper flex-row md:flex-col lg:flex-row justify-between items-center gap-7 xl:gap-0">
        <Link href="/">
          <StrapiImage
            src={logo.image.url}
            alt={logo.image.alternativeText || "No alternative text provided"}
            width={100}
            height={60}
            className="w-auto h-auto"
          />
        </Link>
        <ul className="hidden md:flex justify-center items-center space-x-12 lg:space-x-24 py-4">
          {navigation.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                target={item.isExternal ? "_blank" : "_self"}
              >
                <h5 className="nav-link">{item.text}</h5>
              </Link>
            </li>
          ))}
        </ul>
        <Sheet open={open} onOpenChange={setOpen}>
          {/* 3) only show the "hamburger/more" icon when closed */}
          {!open && (
            <SheetTrigger className="flex items-center justify-center md:hidden">
              <StrapiImage
                src={moreOptionIcon.image.url}
                alt={moreOptionIcon.image.alternativeText || "Open menu"}
                width={40}
                height={40}
                className="rounded-full"
              />
            </SheetTrigger>
          )}
          {open && (
            <SheetClose className="flex items-center justify-center md:hidden">
              <StrapiImage
                src={moreOptionIcon.image.url}
                alt={moreOptionIcon.image.alternativeText || "Close menu"}
                width={40}
                height={40}
                className="rounded-full"
              />
            </SheetClose>
          )}

          <SheetContent side="top">
            <SheetTitle className="hidden">Menu</SheetTitle>
            <ul className="flex flex-col justify-center items-center space-y-6 my-6 ">
              {navigation.map((item) => (
                <li key={item.id}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      target={item.isExternal ? "_blank" : "_self"}
                    >
                      <h5 className="nav-link">{item.text}</h5>
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
            <SheetDescription className="hidden">
              A Menu Containing Parts of the Websites
            </SheetDescription>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
