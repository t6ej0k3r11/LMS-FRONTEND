import * as React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef(({ items = [], className, ...props }, ref) => {
  if (!items.length) return null;

  // If more than 4 items, show first, ellipsis, and last 2
  const shouldTruncate = items.length > 4;
  const displayedItems = shouldTruncate
    ? [items[0], { label: "...", isEllipsis: true }, ...items.slice(-2)]
    : items;

  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn("w-full text-left", className)}
      {...props}
    >
      <motion.ol
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 text-sm"
      >
        {displayedItems.map((item, index) => {
          const isLast = index === displayedItems.length - 1;
          const isEllipsis = item.isEllipsis;

          return (
            <React.Fragment key={item.href || index}>
              <li className="flex items-center">
                {isEllipsis ? (
                  <span className="text-gray-400">...</span>
                ) : item.href && !isLast ? (
                  <a
                    href={item.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors truncate"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(
                      isLast ? "text-gray-800 font-medium" : "text-gray-500",
                      "truncate"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && !isEllipsis && (
                <span className="text-gray-400 px-2 flex-shrink-0">{" > "}</span>
              )}
            </React.Fragment>
          );
        })}
      </motion.ol>
    </nav>
  );
});

Breadcrumb.displayName = "Breadcrumb";

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ),
  className: PropTypes.string,
};

export { Breadcrumb };