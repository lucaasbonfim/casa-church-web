import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as LucideIcons from "lucide-react";

export default function Dropdown({
  children,
  items,
  align = "start",
  sideOffset = 5,
  maxWidth = 280,
}) {
  function renderIcon(iconName) {
    const Icon = LucideIcons[iconName];
    return Icon ? <Icon className="w-4 h-4 shrink-0" /> : null;
  }

  function renderItem(item, index) {
    if (item.type === "separator") {
      return (
        <DropdownMenu.Separator key={index} className="h-px bg-white/10 my-1" />
      );
    }

    if (item.type === "label") {
      return (
        <DropdownMenu.Label
          key={index}
          className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider truncate ${
            item.className || "text-white/50"
          }`}
          title={item.label}
        >
          {item.label}
        </DropdownMenu.Label>
      );
    }

    if (item.type === "submenu") {
      return (
        <DropdownMenu.Sub key={index}>
          <DropdownMenu.SubTrigger
            className={`px-3 py-2 text-sm rounded-md cursor-pointer outline-none flex items-center gap-2 justify-between transition-colors ${
              item.className ||
              "text-white/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0 flex-1">
              {item.icon && renderIcon(item.icon)}
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
            </span>
            <LucideIcons.ChevronRight className="w-3 h-3 shrink-0" />
          </DropdownMenu.SubTrigger>

          <DropdownMenu.Portal>
            <DropdownMenu.SubContent
              className="bg-[#0f1115] rounded-lg shadow-xl p-1 border border-white/10"
              style={{ maxWidth: `${maxWidth}px` }}
              sideOffset={8}
            >
              {item.items?.map((subItem, subIndex) =>
                renderItem(subItem, subIndex)
              )}
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
      );
    }

    return (
      <DropdownMenu.Item
        key={index}
        onSelect={item.onSelect}
        disabled={item.disabled}
        className={`px-3 py-2 text-sm rounded-md cursor-pointer outline-none flex items-center gap-2 transition-colors min-w-0 ${
          item.disabled
            ? "text-white/30 cursor-not-allowed"
            : item.className ||
              "text-white/80 hover:text-white hover:bg-white/5"
        }`}
      >
        {item.icon && renderIcon(item.icon)}
        <span className="truncate flex-1" title={item.label}>
          {item.label}
        </span>
      </DropdownMenu.Item>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className="cursor-pointer inline-flex">{children}</div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-[#0f1115] rounded-lg shadow-xl p-1 border border-white/10 z-50"
          style={{ maxWidth: `${maxWidth}px`, minWidth: "200px" }}
          sideOffset={sideOffset}
          align={align}
        >
          {items.map((item, index) => renderItem(item, index))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
