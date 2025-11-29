import PropTypes from "prop-types";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

const StudentPageLayout = ({
  children,
  title,
  actions,
  breadcrumbOverrides = {},
  showBreadcrumbs = true,
  className = "",
  ...props
}) => {
  const breadcrumbs = useBreadcrumbs(breadcrumbOverrides);

  return (
    <div className={className} {...props}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}

      {/* Header with title and actions */}
      {(title || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Page content */}
      {children}
    </div>
  );
};

StudentPageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  actions: PropTypes.node,
  breadcrumbOverrides: PropTypes.object,
  showBreadcrumbs: PropTypes.bool,
  className: PropTypes.string,
};

export default StudentPageLayout;