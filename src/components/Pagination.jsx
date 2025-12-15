import Button from "./Button";

function getVisiblePages(current, total) {
  const delta = 2;
  const start = Math.max(1, current - delta);
  const end = Math.min(total, current + delta);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function NavButton({ icon, disabled, onClick }) {
  return (
    <Button
      size="sm"
      style={2}
      disabled={disabled}
      onClick={onClick}
      icon={icon}
      iconSize={16}
      className="w-9! h-9! p-0!"
    />
  );
}

function PageButton({ page, isActive, onClick, disabled }) {
  return (
    <Button
      size="sm"
      style={isActive ? 1 : 2}
      onClick={onClick}
      disabled={disabled}
      className={`w-9! h-9! p-0! ${
        isActive ? "shadow-lg shadow-white/20" : ""
      }`}
    >
      {page}
    </Button>
  );
}

function Ellipsis() {
  return (
    <span className="w-9 h-9 flex items-center justify-center text-white/40 text-sm">
      ...
    </span>
  );
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const total = Math.max(1, Number(totalPages) || 1);
  const page = Math.max(1, Math.min(Number(currentPage) || 1, total));
  const isDisabled = total <= 1;

  const visiblePages = getVisiblePages(page, total);
  const showStartEllipsis = visiblePages[0] > 1;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < total;

  const goToPage = (targetPage) => {
    if (isDisabled) return;
    const validPage = Math.max(1, Math.min(targetPage, total));
    if (validPage !== page) onPageChange?.(validPage);
  };

  return (
    <div
      className={`flex items-center justify-center gap-1.5 mt-12 ${
        isDisabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <NavButton
        icon="ChevronLeft"
        disabled={isDisabled || page === 1}
        onClick={() => goToPage(page - 1)}
      />

      {showStartEllipsis && <Ellipsis />}

      {visiblePages.map((p) => (
        <PageButton
          key={p}
          page={p}
          isActive={p === page}
          disabled={isDisabled}
          onClick={() => goToPage(p)}
        />
      ))}

      {showEndEllipsis && <Ellipsis />}

      <NavButton
        icon="ChevronRight"
        disabled={isDisabled || page === total}
        onClick={() => goToPage(page + 1)}
      />
    </div>
  );
}
