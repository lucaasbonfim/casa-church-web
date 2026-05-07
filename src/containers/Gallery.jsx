import { useEffect, useMemo, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Images,
  PlusSquare,
  Upload,
  X,
} from "lucide-react";
import Button from "../components/Button";
import {
  deleteGalleryFolder,
  deleteGalleryPhoto,
  findGalleryFolders,
  findGalleryPhotos,
  uploadGalleryPhoto,
} from "../services/gallery/galleryService";
import {
  canAccessAdminArea,
  hasAdminModuleAccess,
} from "../utils/adminPermissions";
import { getStoredUser, hasValidStoredSession } from "../utils/authStorage";
import { toastError, toastSuccess } from "../utils/toastHelper";

const PHOTO_PAGE_SIZE = 32;
const PREVIEW_SWIPE_THRESHOLD_PX = 64;

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function SelectMenu({ value, onChange, options, placeholder = "Selecionar" }) {
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-lg border border-white/15 bg-black/25 px-3 text-left text-sm text-white transition-colors hover:border-white/30"
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronDown size={16} className="text-white/60" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg border border-white/15 bg-[#111722] p-2 shadow-2xl"
        >
          <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>
            <div className="max-h-72 overflow-y-auto pr-1">
              {options.map((option) => (
                <DropdownMenu.RadioItem
                  key={option.value || "__all__"}
                  value={option.value}
                  className="group flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm text-white/85 outline-none transition-colors hover:bg-white/10 data-[state=checked]:bg-white/10"
                >
                  <span className="truncate">{option.label}</span>
                  <DropdownMenu.ItemIndicator>
                    <Check size={14} className="text-white/90" />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </div>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function PhotoSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 16 }).map((_, index) => (
        <div
          key={index}
          className="aspect-square animate-pulse rounded-lg border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}

function FolderSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-lg border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}

function ActionSheet({ open, title, subtitle, actions, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-white/10 bg-[#121824] p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4">
          <p className="text-sm font-semibold text-white">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-white/60">{subtitle}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`flex h-11 w-full items-center justify-center rounded-lg border text-sm transition-colors ${
                action.destructive
                  ? "border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                  : "border-white/15 bg-black/20 text-white/85 hover:bg-white/10"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-white/15 bg-black/20 text-sm text-white/75 transition-colors hover:bg-white/10"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function DesktopContextMenu({
  open,
  title,
  subtitle,
  actions,
  anchor,
  viewport,
  onClose,
}) {
  if (!open) return null;

  const menuWidth = 260;
  const estimatedMenuHeight = 220;
  const left = Math.max(
    12,
    Math.min(anchor?.x ?? viewport.width / 2, viewport.width - menuWidth - 12),
  );
  const top = Math.max(
    12,
    Math.min(
      anchor?.y ?? viewport.height / 2,
      viewport.height - estimatedMenuHeight - 12,
    ),
  );

  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div
        style={{ left, top, width: menuWidth }}
        className="absolute rounded-xl border border-white/15 bg-[#121824] p-2 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-2 pb-2">
          <p className="text-sm font-semibold text-white">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-white/60">{subtitle}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`flex h-10 w-full items-center justify-center rounded-lg text-sm transition-colors ${
                action.destructive
                  ? "bg-red-500/12 text-red-200 hover:bg-red-500/25"
                  : "bg-white/8 text-white/85 hover:bg-white/15"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const queryClient = useQueryClient();
  const storedUser = getStoredUser();
  const canUpload =
    hasValidStoredSession() &&
    canAccessAdminArea(storedUser) &&
    (hasAdminModuleAccess(storedUser, "gallery") ||
      hasAdminModuleAccess(storedUser, "events") ||
      hasAdminModuleAccess(storedUser, "posts"));

  const [viewMode, setViewMode] = useState("photos");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [orderDirection, setOrderDirection] = useState("DESC");
  const [activePhotoIndex, setActivePhotoIndex] = useState(-1);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFolderMode, setUploadFolderMode] = useState("existing");
  const [uploadExistingFolder, setUploadExistingFolder] = useState("");
  const [uploadNewFolder, setUploadNewFolder] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [actionTarget, setActionTarget] = useState(null);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const previewFrameRef = useRef(null);
  const previewJumpRafRef = useRef(null);
  const previewWheelTimeoutRef = useRef(null);
  const previewWheelLockedRef = useRef(false);
  const previewDragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    active: false,
  });
  const [previewDragOffset, setPreviewDragOffset] = useState(0);
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);
  const [isPreviewJumping, setIsPreviewJumping] = useState(false);

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (previewJumpRafRef.current) {
        cancelAnimationFrame(previewJumpRafRef.current);
      }
      if (previewWheelTimeoutRef.current) {
        clearTimeout(previewWheelTimeoutRef.current);
      }
    };
  }, []);

  const { data: foldersData, isLoading: loadingFolders } = useQuery({
    queryKey: ["gallery-folders"],
    queryFn: findGalleryFolders,
  });

  const folderOptions = useMemo(
    () => [
      { value: "", label: "Todas as pastas" },
      ...((foldersData?.folders || []).map((folder) => ({
        value: folder.path,
        label: `${folder.label} (${folder.count || 0})`,
      })) || []),
    ],
    [foldersData],
  );

  const {
    data: photosPages,
    isLoading: loadingPhotos,
    isFetching: fetchingPhotos,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["gallery-photos", selectedFolder, orderDirection],
    queryFn: ({ pageParam }) =>
      findGalleryPhotos({
        folder: selectedFolder || undefined,
        orderDirection,
        limit: PHOTO_PAGE_SIZE,
        nextCursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    initialPageParam: undefined,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const photos = useMemo(
    () => (photosPages?.pages || []).flatMap((page) => page?.photos || []),
    [photosPages],
  );

  const uploadMutation = useMutation({
    mutationFn: async ({ files, folder }) => {
      for (const file of files) {
        await uploadGalleryPhoto({ file, folder });
      }

      return files.length;
    },
    onSuccess: (count) => {
      toastSuccess(`${count} foto(s) enviada(s) com sucesso.`);
      setUploadFiles([]);
      setUploadNewFolder("");
      queryClient.invalidateQueries({ queryKey: ["gallery-folders"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-photos"] });
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Nao foi possivel enviar as fotos.",
      );
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (publicId) => deleteGalleryPhoto(publicId),
    onSuccess: () => {
      toastSuccess("Foto removida com sucesso.");
      if (actionTarget?.type === "photo") {
        const deletedPublicId = actionTarget.item?.publicId;
        if (activePhoto?.publicId === deletedPublicId) {
          setActivePhotoIndex(-1);
        }
      }
      setActionTarget(null);
      queryClient.invalidateQueries({ queryKey: ["gallery-folders"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-photos"] });
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Nao foi possivel remover a foto.",
      );
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (folder) => deleteGalleryFolder(folder),
    onSuccess: () => {
      toastSuccess("Pasta removida com sucesso.");
      const deletedFolder = actionTarget?.item?.path;

      if (deletedFolder && selectedFolder === deletedFolder) {
        setSelectedFolder("");
      }

      if (deletedFolder && uploadExistingFolder === deletedFolder) {
        setUploadExistingFolder("");
      }

      setActionTarget(null);
      queryClient.invalidateQueries({ queryKey: ["gallery-folders"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-photos"] });
    },
    onError: (error) => {
      toastError(
        error?.response?.data?.message || "Nao foi possivel remover a pasta.",
      );
    },
  });

  const activePhoto = activePhotoIndex >= 0 ? photos[activePhotoIndex] : null;

  useEffect(() => {
    if (!activePhoto) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activePhoto]);

  useEffect(() => {
    if (activePhotoIndex < 0 || typeof window === "undefined") return;

    [activePhotoIndex - 1, activePhotoIndex, activePhotoIndex + 1].forEach(
      (index) => {
        const photo = photos[index];
        if (!photo?.url) return;

        const image = new Image();
        image.decoding = "async";
        image.src = photo.url;
      },
    );
  }, [activePhotoIndex, photos]);

  const selectedFolderLabel = useMemo(() => {
    const folder = foldersData?.folders?.find(
      (item) => item.path === selectedFolder,
    );
    return folder?.label || "Todas as pastas";
  }, [foldersData, selectedFolder]);

  const resolvedUploadFolder = useMemo(() => {
    if (uploadFolderMode === "new") {
      return uploadNewFolder.trim();
    }

    return uploadExistingFolder || selectedFolder || "";
  }, [selectedFolder, uploadExistingFolder, uploadFolderMode, uploadNewFolder]);

  const actionSheetConfig = (() => {
    if (!actionTarget) return null;

    if (actionTarget.type === "photo") {
      const photo = actionTarget.item;
      return {
        title: "Opcoes da foto",
        subtitle: `${photo?.folderLabel || "Geral"} • ${formatDate(
          photo?.createdAt,
        )}`,
        actions: [
          {
            label: "Abrir foto",
            onClick: () => {
              const index = photos.findIndex(
                (item) => item.publicId === photo.publicId,
              );
              if (index >= 0) {
                setPreviewDragOffset(0);
                setIsPreviewDragging(false);
                setIsPreviewJumping(false);
                setActivePhotoIndex(index);
              }
              setActionTarget(null);
            },
          },
          {
            label: "Excluir foto",
            destructive: true,
            onClick: () => {
              const confirmed = window.confirm(
                "Deseja excluir esta foto da galeria?",
              );
              if (!confirmed) return;
              deletePhotoMutation.mutate(photo.publicId);
            },
          },
        ],
      };
    }

    if (actionTarget.type === "folder") {
      const folder = actionTarget.item;
      return {
        title: "Opcoes da pasta",
        subtitle: `${folder?.label || "Pasta"} • ${folder?.count || 0} foto(s)`,
        actions: [
          {
            label: "Abrir pasta",
            onClick: () => {
              openFolderPhotos(folder.path);
              setActionTarget(null);
            },
          },
          {
            label: "Excluir pasta inteira",
            destructive: true,
            onClick: () => {
              const confirmed = window.confirm(
                `Deseja excluir a pasta "${folder.label}" e todas as fotos dentro dela?`,
              );
              if (!confirmed) return;
              deleteFolderMutation.mutate(folder.path);
            },
          },
        ],
      };
    }

    return null;
  })();

  const isDesktop = viewport.width >= 1024;

  function handleSelectFiles(event) {
    const files = Array.from(event.target.files || []);
    setUploadFiles(files);
  }

  function handleUpload() {
    if (uploadFiles.length === 0) {
      toastError("Selecione pelo menos uma imagem para enviar.");
      return;
    }

    if (!resolvedUploadFolder.trim()) {
      toastError("Defina uma pasta existente ou crie uma nova.");
      return;
    }

    uploadMutation.mutate({
      files: uploadFiles,
      folder: resolvedUploadFolder,
    });
  }

  function openFolderPhotos(folderPath) {
    setSelectedFolder(folderPath);
    setViewMode("photos");
  }

  function openPhotoActions(photo) {
    if (!canUpload) return;
    setActionTarget({
      type: "photo",
      item: photo,
      anchor: null,
    });
  }

  function openPhotoActionsAt(photo, anchor) {
    if (!canUpload) return;
    setActionTarget({ type: "photo", item: photo, anchor: anchor || null });
  }

  function openFolderActions(folder) {
    if (!canUpload) return;
    setActionTarget({
      type: "folder",
      item: folder,
      anchor: null,
    });
  }

  function openFolderActionsAt(folder, anchor) {
    if (!canUpload) return;
    setActionTarget({ type: "folder", item: folder, anchor: anchor || null });
  }

  function closeActionSheet() {
    setActionTarget(null);
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function startLongPress(callback) {
    if (!canUpload) return;

    clearLongPressTimer();
    longPressTriggeredRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      callback();
    }, 520);
  }

  function clearPreviewJumpFrame() {
    if (previewJumpRafRef.current) {
      cancelAnimationFrame(previewJumpRafRef.current);
      previewJumpRafRef.current = null;
    }
  }

  function showPhotoAt(index, behavior = "smooth") {
    if (photos.length === 0) return;

    const nextIndex = clamp(index, 0, photos.length - 1);
    const distanceFromCurrent =
      activePhotoIndex >= 0 ? Math.abs(nextIndex - activePhotoIndex) : 0;
    const shouldJump = behavior === "auto" || distanceFromCurrent > 1;

    clearPreviewJumpFrame();
    setPreviewDragOffset(0);
    setIsPreviewDragging(false);

    if (shouldJump) {
      setIsPreviewJumping(true);
    }

    setActivePhotoIndex(nextIndex);

    if (shouldJump) {
      previewJumpRafRef.current = requestAnimationFrame(() => {
        setIsPreviewJumping(false);
        previewJumpRafRef.current = null;
      });
    }
  }

  function handlePreviewWheel(event) {
    if (event.ctrlKey || photos.length <= 1) return;

    const dominantDelta =
      Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;

    if (Math.abs(dominantDelta) < 35) return;

    event.preventDefault();
    if (previewWheelLockedRef.current) return;

    previewWheelLockedRef.current = true;

    if (dominantDelta > 0) {
      goNextPhoto();
    } else {
      goPrevPhoto();
    }

    if (previewWheelTimeoutRef.current) {
      clearTimeout(previewWheelTimeoutRef.current);
    }

    previewWheelTimeoutRef.current = setTimeout(() => {
      previewWheelLockedRef.current = false;
      previewWheelTimeoutRef.current = null;
    }, 360);
  }

  function handlePreviewPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;

    previewDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: 0,
      offsetY: 0,
      active: false,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    clearPreviewJumpFrame();
    setIsPreviewJumping(false);
    setIsPreviewDragging(true);
  }

  function handlePreviewPointerMove(event) {
    const drag = previewDragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const rawOffsetX = event.clientX - drag.startX;
    const offsetY = event.clientY - drag.startY;
    const isHorizontalIntent = Math.abs(rawOffsetX) > Math.abs(offsetY);

    if (!drag.active && Math.abs(rawOffsetX) < 6 && Math.abs(offsetY) < 6) {
      return;
    }

    drag.active = true;
    drag.offsetY = offsetY;

    if (isHorizontalIntent) {
      event.preventDefault();
    }

    const isPullingPastStart = activePhotoIndex === 0 && rawOffsetX > 0;
    const isPullingPastEnd =
      activePhotoIndex === photos.length - 1 && rawOffsetX < 0;
    const resistance = isPullingPastStart || isPullingPastEnd ? 0.35 : 1;
    const offsetX = rawOffsetX * resistance;

    drag.offsetX = offsetX;
    setPreviewDragOffset(offsetX);
  }

  function finishPreviewDrag(event, canceled = false) {
    const drag = previewDragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const frameWidth =
      previewFrameRef.current?.clientWidth || window.innerWidth || 1;
    const threshold = Math.max(
      PREVIEW_SWIPE_THRESHOLD_PX,
      Math.min(120, frameWidth * 0.18),
    );
    const shouldMove =
      !canceled &&
      Math.abs(drag.offsetX) > threshold &&
      Math.abs(drag.offsetX) > Math.abs(drag.offsetY);

    let nextIndex = activePhotoIndex;
    if (shouldMove) {
      nextIndex = drag.offsetX < 0 ? activePhotoIndex + 1 : activePhotoIndex - 1;
      nextIndex = clamp(nextIndex, 0, photos.length - 1);
    }

    const pointerTarget = event.currentTarget;
    const pointerId = drag.pointerId;

    previewDragRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      active: false,
    };

    if (pointerTarget.hasPointerCapture?.(pointerId)) {
      pointerTarget.releasePointerCapture(pointerId);
    }

    setIsPreviewDragging(false);
    setPreviewDragOffset(0);
    setActivePhotoIndex(nextIndex);
  }

  function closePreview() {
    clearPreviewJumpFrame();
    if (previewWheelTimeoutRef.current) {
      clearTimeout(previewWheelTimeoutRef.current);
      previewWheelTimeoutRef.current = null;
    }
    previewWheelLockedRef.current = false;
    setPreviewDragOffset(0);
    setIsPreviewDragging(false);
    setIsPreviewJumping(false);
    setActivePhotoIndex(-1);
  }

  function goPrevPhoto() {
    showPhotoAt(activePhotoIndex - 1);
  }

  function goNextPhoto() {
    showPhotoAt(activePhotoIndex + 1);
  }

  const previewTrackStyle = {
    transform: `translate3d(calc(${-activePhotoIndex * 100}% + ${previewDragOffset}px), 0, 0)`,
    transition:
      isPreviewDragging || isPreviewJumping
        ? "none"
        : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
    willChange: "transform",
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm text-white/55">
              <Images size={16} />
              Galeria da Casa Church
            </p>
            <h1 className="text-3xl font-bold lg:text-4xl">
              Fotos dos cultos e eventos
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60 lg:text-base">
              Interface de galeria com navegação por pastas, ordem cronológica e
              preview rápido.
            </p>
          </div>

          {canUpload ? (
            <Button
              style={2}
              onClick={() => setIsUploadOpen((current) => !current)}
              className="h-11 px-4"
            >
              <Upload size={16} />
              {isUploadOpen ? "Fechar upload" : "Enviar imagens"}
            </Button>
          ) : null}
        </div>

        {isUploadOpen ? (
          <div className="mb-4 rounded-xl border border-white/15 bg-[#151b27] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setUploadFolderMode("existing")}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  uploadFolderMode === "existing"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/75 hover:bg-white/20"
                }`}
              >
                Pasta existente
              </button>
              <button
                type="button"
                onClick={() => setUploadFolderMode("new")}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  uploadFolderMode === "new"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/75 hover:bg-white/20"
                }`}
              >
                Criar nova pasta
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                {uploadFolderMode === "existing" ? (
                  <>
                    <label className="block text-xs uppercase tracking-[0.14em] text-white/45">
                      Pasta destino
                    </label>
                    <SelectMenu
                      value={uploadExistingFolder}
                      onChange={setUploadExistingFolder}
                      options={folderOptions}
                      placeholder="Selecione uma pasta"
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-xs uppercase tracking-[0.14em] text-white/45">
                      Nome da nova pasta
                    </label>
                    <input
                      value={uploadNewFolder}
                      onChange={(event) =>
                        setUploadNewFolder(event.target.value)
                      }
                      placeholder="ex: culto-24-04-2026"
                      className="h-11 w-full rounded-lg border border-white/15 bg-black/25 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
                    />
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-black/25 px-4 text-sm text-white/85 transition-colors hover:border-white/35 hover:bg-black/35">
                  <PlusSquare size={16} className="mr-2" />
                  Selecionar fotos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSelectFiles}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-white/60">
                  {uploadFiles.length} arquivo(s) selecionado(s)
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-white/60">
                Destino: {resolvedUploadFolder || "nenhuma pasta definida"}
              </p>
              <Button
                style={1}
                onClick={handleUpload}
                loading={uploadMutation.isPending}
                className="h-10 px-4"
              >
                <Upload size={16} />
                Enviar agora
              </Button>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-end">
            <div>
              <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/45">
                Visualização
              </span>
              <div className="flex h-11 overflow-hidden rounded-lg border border-white/15 bg-black/25">
                <button
                  type="button"
                  onClick={() => setViewMode("photos")}
                  className={`px-4 text-sm transition-colors ${
                    viewMode === "photos"
                      ? "bg-white text-black"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Fotos
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("folders")}
                  className={`px-4 text-sm transition-colors ${
                    viewMode === "folders"
                      ? "bg-white text-black"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Pastas
                </button>
              </div>
            </div>

            <div>
              <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/45">
                Pasta
              </span>
              <SelectMenu
                value={selectedFolder}
                onChange={setSelectedFolder}
                options={folderOptions}
                placeholder="Todas as pastas"
              />
            </div>

            <div>
              <span className="mb-1 block text-xs uppercase tracking-[0.14em] text-white/45">
                Ordem
              </span>
              <div className="flex h-11 overflow-hidden rounded-lg border border-white/15 bg-black/25">
                <button
                  type="button"
                  onClick={() => setOrderDirection("DESC")}
                  className={`flex items-center gap-2 px-4 text-sm transition-colors ${
                    orderDirection === "DESC"
                      ? "bg-white text-black"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <ArrowDownAZ size={16} />
                  Mais recentes
                </button>
                <button
                  type="button"
                  onClick={() => setOrderDirection("ASC")}
                  className={`flex items-center gap-2 px-4 text-sm transition-colors ${
                    orderDirection === "ASC"
                      ? "bg-white text-black"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <ArrowUpAZ size={16} />
                  Mais antigas
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-white/55">
            <span>{selectedFolderLabel}</span>
            <span>
              {viewMode === "photos"
                ? `${photos.length} foto(s) carregada(s)`
                : `${foldersData?.folders?.length || 0} pasta(s)`}
            </span>
          </div>

          {canUpload ? (
            <p className="mb-3 text-[11px] text-white/45">
              Segure uma foto ou pasta (ou clique com botao direito) para abrir
              opcoes de exclusao.
            </p>
          ) : null}

          <div className="h-[78vh] overflow-hidden rounded-xl border border-white/10 bg-[#0f141f]">
            <div className="h-full overflow-y-auto p-3 md:p-4">
              {viewMode === "folders" ? (
                loadingFolders ? (
                  <FolderSkeletonGrid />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {(foldersData?.folders || []).map((folder) => (
                      <button
                        key={folder.path}
                        type="button"
                        onClick={() => {
                          if (longPressTriggeredRef.current) {
                            longPressTriggeredRef.current = false;
                            return;
                          }
                          openFolderPhotos(folder.path);
                        }}
                        onContextMenu={(event) => {
                          if (!canUpload) return;
                          event.preventDefault();
                          openFolderActionsAt(folder, {
                            x: event.clientX,
                            y: event.clientY,
                          });
                        }}
                        onTouchStart={() =>
                          startLongPress(() => openFolderActions(folder))
                        }
                        onTouchEnd={clearLongPressTimer}
                        onTouchMove={clearLongPressTimer}
                        className="group overflow-hidden rounded-lg border border-white/10 bg-black/25 text-left transition-all hover:border-white/35 hover:bg-black/35"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden border-b border-white/10 bg-black/30">
                          {folder.coverUrl ? (
                            <img
                              src={folder.coverUrl}
                              alt={folder.label}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-white/35">
                              <FolderOpen size={30} />
                            </div>
                          )}
                          {canUpload ? (
                            <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white/80">
                              Segure
                            </span>
                          ) : null}
                        </div>
                        <div className="space-y-1 px-3 py-2.5">
                          <p className="truncate text-sm font-medium">
                            {folder.label}
                          </p>
                          <p className="text-xs text-white/55">
                            {folder.count || 0} foto(s)
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : loadingPhotos ? (
                <PhotoSkeletonGrid />
              ) : photos.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => {
                          if (longPressTriggeredRef.current) {
                            longPressTriggeredRef.current = false;
                            return;
                          }
                          showPhotoAt(index, "auto");
                        }}
                        onContextMenu={(event) => {
                          if (!canUpload) return;
                          event.preventDefault();
                          openPhotoActionsAt(photo, {
                            x: event.clientX,
                            y: event.clientY,
                          });
                        }}
                        onTouchStart={() =>
                          startLongPress(() => openPhotoActions(photo))
                        }
                        onTouchEnd={clearLongPressTimer}
                        onTouchMove={clearLongPressTimer}
                        className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/20 transition-all hover:border-white/30 focus-visible:outline-none"
                      >
                        <img
                          src={photo.url}
                          alt={photo.folderLabel || "Foto"}
                          loading="lazy"
                          className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {canUpload ? (
                          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white/80">
                            Segure
                          </span>
                        ) : null}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2 text-left opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                          <p className="truncate text-[11px] font-medium text-white">
                            {photo.folderLabel || "Geral"}
                          </p>
                          <p className="text-[10px] text-white/80">
                            {formatDate(photo.createdAt)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-2 pt-1">
                    {fetchingPhotos && !isFetchingNextPage ? (
                      <p className="text-xs text-white/45">
                        Atualizando galeria...
                      </p>
                    ) : null}

                    {hasNextPage ? (
                      <Button
                        style={2}
                        onClick={() => fetchNextPage()}
                        loading={isFetchingNextPage}
                        className="h-10 px-4"
                      >
                        Carregar mais
                      </Button>
                    ) : (
                      <p className="text-xs text-white/45">
                        Fim da lista para os filtros atuais.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-white/55">
                  <p>Nenhuma foto encontrada com os filtros atuais.</p>
                  {selectedFolder ? (
                    <button
                      type="button"
                      onClick={() => setSelectedFolder("")}
                      className="mt-3 text-sm text-white/80 underline"
                    >
                      Limpar filtro de pasta
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {activePhoto ? (
        <div className="fixed inset-0 z-50 bg-black text-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/85 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />

          <div className="absolute left-4 top-4 z-30 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
            {activePhotoIndex + 1} / {photos.length}
          </div>

          <button
            type="button"
            onClick={closePreview}
            aria-label="Fechar foto"
            className="absolute right-4 top-4 z-30 rounded-full bg-black/55 p-2 text-white/90 backdrop-blur transition-colors hover:bg-white/15"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={goPrevPhoto}
            disabled={activePhotoIndex <= 0}
            aria-label="Foto anterior"
            className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/45 p-3 text-white/90 backdrop-blur transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30 md:block"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={goNextPhoto}
            disabled={activePhotoIndex >= photos.length - 1}
            aria-label="Proxima foto"
            className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-black/45 p-3 text-white/90 backdrop-blur transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30 md:block"
          >
            <ChevronRight size={24} />
          </button>

          <div
            ref={previewFrameRef}
            onWheel={handlePreviewWheel}
            onPointerDown={handlePreviewPointerDown}
            onPointerMove={handlePreviewPointerMove}
            onPointerUp={finishPreviewDrag}
            onPointerCancel={(event) => finishPreviewDrag(event, true)}
            onLostPointerCapture={(event) => finishPreviewDrag(event, true)}
            className="h-full overflow-hidden"
            style={{ touchAction: "none" }}
          >
            <div
              className="flex h-full w-full"
              style={previewTrackStyle}
            >
              {photos.map((photo, index) => (
                <div
                  key={photo.publicId || photo.id}
                  className="flex h-full w-full shrink-0 items-center justify-center px-3 pb-36 pt-16 sm:px-8 sm:pb-40"
                >
                  <img
                    src={photo.url}
                    alt={photo.folderLabel || "Foto da galeria"}
                    loading={
                      Math.abs(index - activePhotoIndex) <= 1 ? "eager" : "lazy"
                    }
                    decoding="async"
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                    className="pointer-events-none max-h-full max-w-full select-none object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-30">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pb-4">
              <div className="flex flex-wrap items-end justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-white">
                    {activePhoto.folderLabel || "Geral"}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    {formatDate(activePhoto.createdAt)}
                  </p>
                </div>
                <p className="text-xs text-white/55">
                  Role, arraste ou use as setas para navegar.
                </p>
              </div>

              <div className="cc-hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, index) => (
                  <button
                    key={photo.publicId || photo.id}
                    type="button"
                    onClick={() => showPhotoAt(index)}
                    aria-label={`Abrir foto ${index + 1}`}
                    className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border transition-all ${
                      activePhotoIndex === index
                        ? "border-white opacity-100"
                        : "border-white/20 opacity-55 hover:opacity-85"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.folderLabel || "Miniatura da foto"}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isDesktop ? (
        <DesktopContextMenu
          open={Boolean(actionSheetConfig)}
          title={actionSheetConfig?.title || ""}
          subtitle={actionSheetConfig?.subtitle || ""}
          actions={actionSheetConfig?.actions || []}
          anchor={actionTarget?.anchor || null}
          viewport={viewport}
          onClose={closeActionSheet}
        />
      ) : (
        <ActionSheet
          open={Boolean(actionSheetConfig)}
          title={actionSheetConfig?.title || ""}
          subtitle={actionSheetConfig?.subtitle || ""}
          actions={actionSheetConfig?.actions || []}
          onClose={closeActionSheet}
        />
      )}
    </div>
  );
}
