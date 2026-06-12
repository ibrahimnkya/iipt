import NextLink, { LinkProps } from "next/link";
import React from "react";

export interface CustomLinkProps extends LinkProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  id?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ children, ...props }, ref) => {
    return (
      <NextLink {...props} ref={ref} suppressHydrationWarning>
        {children}
      </NextLink>
    );
  }
);

Link.displayName = "Link";

export default Link;
