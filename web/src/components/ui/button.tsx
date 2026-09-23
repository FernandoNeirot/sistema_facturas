import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const buttonClass =
  "rounded-md bg-gray-900 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300";

type ButtonAsButton = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: undefined;
};

type ButtonAsLink = {
  children: ReactNode;
  className?: string;
  href: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const classes = `${buttonClass} ${props.className ?? ""}`.trim();

  if (props.href) {
    return (
      <Link href={props.href} className={classes}>
        {props.children}
      </Link>
    );
  }

  const { children, ...rest } = props;
  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}
