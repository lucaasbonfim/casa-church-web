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
const MIN_PREVIEW_SCALE = 1;
const MAX_PREVIEW_SCALE = 4;
const SWIPE_THRESHOLD_PX = 70;

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

function getTouchDistance(touchA, touchB) {
  const dx = touchA.clientX - touchB.clientX;
  const dy = touchA.clientY - touchB.clientY;
  return Math.sqrt(dx * dx + dy * dy);
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
    Math.min(anchor?.x ?? viewport.width / 2, viewport.width - menuWidth - 12)
  );
  const top = Math.max(
    12,
    Math.min(
      anchor?.y ?? viewport.height / 2,
      viewport.height - estimatedMenuHeight - 12
    )
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
  const [previewScale, setPreviewScale] = useState(1);
  const [previewOffset, setPreviewOffset] = useState({ x: 0, y: 0 });
  const [isPreviewInteracting, setIsPreviewInteracting] = useState(false);

  const longPressTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const previewFrameRef = useRef(null);
  const previewGestureRef = useRef({
    mode: "idle",
    startX: 0,
    startY: 0,
    swipeDx: 0,
    swipeDy: 0,
    startScale: 1,
    startDistance: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });
  const lastTapRef = useRef(0);

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
    setPreviewScale(1);
    setPreviewOffset({ x: 0, y: 0 });
    setIsPreviewInteracting(false);
    previewGestureRef.current = {
      mode: "idle",
      startX: 0,
      startY: 0,
      swipeDx: 0,
      swipeDy: 0,
      startScale: 1,
      startDistance: 0,
      startOffsetX: 0,
      startOffsetY: 0,
    };
  }, [activePhotoIndex]);

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
    [foldersData]
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
    [photosPages]
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
        error?.response?.data?.message || "Nao foi possivel enviar as fotos."
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
        error?.response?.data?.message || "Nao foi possivel remover a foto."
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
        error?.response?.data?.message || "Nao foi possivel remover a pasta."
      );
    },
  });

  const activePhoto = activePhotoIndex >= 0 ? photos[activePhotoIndex] : null;

  const selectedFolderLabel = useMemo(() => {
    const folder = foldersData?.folders?.find((item) => item.path === selectedFolder);
    return folder?.label || "Todas as pastas";
  }, [foldersData, selectedFolder]);

  const resolvedUploadFolder = useMemo(() => {
    if (uploadFolderMode === "new") {
      return uploadNewFolder.trim();
    }

    return uploadExistingFolder || selectedFolder || "";
  }, [selectedFolder, uploadExistingFolder, uploadFolderMode, uploadNewFolder]);

  const actionSheetConfig = useMemo(() => {
    if (!actionTarget) return null;

    if (actionTarget.type === "photo") {
      const photo = actionTarget.item;
      return {
        title: "Opcoes da foto",
        subtitle: `${photo?.folderLabel || "Geral"} • ${formatDate(
          photo?.createdAt
        )}`,
        actions: [
          {
            label: "Abrir foto",
            onClick: () => {
              const index = photos.findIndex(
                (item) => item.publicId === photo.publicId
              );
              if (index >= 0) {
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
                "Deseja excluir esta foto da galeria?"
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
                `Deseja excluir a pasta "${folder.label}" e todas as fotos dentro dela?`
              );
              if (!confirmed) return;
              deleteFolderMutation.mutate(folder.path);
            },
          },
        ],
      };
    }

    return null;
  }, [
    actionTarget,
    deleteFolderMutation,
    deletePhotoMutation,
    photos,
  ]);

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

  function clampPreviewOffset(nextOffset, scale) {
    if (scale <= MIN_PREVIEW_SCALE) {
      return { x: 0, y: 0 };
    }

    const frame = previewFrameRef.current;
    if (!frame) return nextOffset;

    const maxX = Math.max(0, ((frame.clientWidth * scale) - frame.clientWidth) / 2);
    const maxY = Math.max(0, ((frame.clientHeight * scale) - frame.clientHeight) / 2);

    return {
      x: clamp(nextOffset.x, -maxX, maxX),
      y: clamp(nextOffset.y, -maxY, maxY),
    };
  }

  function setScaleWithClamp(nextScale) {
    const clampedScale = clamp(nextScale, MIN_PREVIEW_SCALE, MAX_PREVIEW_SCALE);
    setPreviewScale(clampedScale);
    setPreviewOffset((current) => clampPreviewOffset(current, clampedScale));
  }

  function handlePreviewTouchStart(event) {
    setIsPreviewInteracting(true);
    const touches = event.touches;
    if (!touches || touches.length === 0) return;

    if (touches.length === 2) {
      const distance = getTouchDistance(touches[0], touches[1]);
      previewGestureRef.current = {
        ...previewGestureRef.current,
        mode: "pinch",
        startDistance: distance,
        startScale: previewScale,
      };
      return;
    }

    const touch = touches[0];
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 300;
    lastTapRef.current = now;

    if (isDoubleTap) {
      const nextScale = previewScale > 1.2 ? 1 : 2.2;
      setScaleWithClamp(nextScale);
      if (nextScale <= 1.01) {
        setPreviewOffset({ x: 0, y: 0 });
      }
      return;
    }

    previewGestureRef.current = {
      ...previewGestureRef.current,
      mode: previewScale > 1.02 ? "pan" : "swipe",
      startX: touch.clientX,
      startY: touch.clientY,
      swipeDx: 0,
      swipeDy: 0,
      startOffsetX: previewOffset.x,
      startOffsetY: previewOffset.y,
      startScale: previewScale,
      startDistance: 0,
    };
  }

  function handlePreviewTouchMove(event) {
    const touches = event.touches;
    if (!touches || touches.length === 0) return;

    if (touches.length === 2) {
      const gesture = previewGestureRef.current;
      const currentDistance = getTouchDistance(touches[0], touches[1]);
      const baseDistance = gesture.startDistance || currentDistance;
      const baseScale = gesture.startScale || previewScale;
      const nextScale = baseScale * (currentDistance / baseDistance);

      event.preventDefault();
      setScaleWithClamp(nextScale);
      previewGestureRef.current.mode = "pinch";
      return;
    }

    const gesture = previewGestureRef.current;
    const touch = touches[0];
    const dx = touch.clientX - gesture.startX;
    const dy = touch.clientY - gesture.startY;

    if (previewScale > 1.02 || gesture.mode === "pan") {
      event.preventDefault();
      previewGestureRef.current.mode = "pan";
      const nextOffset = {
        x: gesture.startOffsetX + dx,
        y: gesture.startOffsetY + dy,
      };
      setPreviewOffset(clampPreviewOffset(nextOffset, previewScale));
      return;
    }

    previewGestureRef.current.swipeDx = dx;
    previewGestureRef.current.swipeDy = dy;
  }

  function handlePreviewTouchEnd(event) {
    const gesture = previewGestureRef.current;

    if (!event.touches || event.touches.length === 0) {
      setIsPreviewInteracting(false);
      if (
        gesture.mode === "swipe" &&
        previewScale <= 1.02 &&
        Math.abs(gesture.swipeDx) > SWIPE_THRESHOLD_PX &&
        Math.abs(gesture.swipeDx) > Math.abs(gesture.swipeDy)
      ) {
        if (gesture.swipeDx < 0) {
          goNextPhoto();
        } else {
          goPrevPhoto();
        }
      }

      previewGestureRef.current = {
        mode: "idle",
        startX: 0,
        startY: 0,
        swipeDx: 0,
        swipeDy: 0,
        startScale: previewScale,
        startDistance: 0,
        startOffsetX: previewOffset.x,
        startOffsetY: previewOffset.y,
      };
    }
  }

  function closePreview() {
    setPreviewScale(1);
    setPreviewOffset({ x: 0, y: 0 });
    setIsPreviewInteracting(false);
    setActivePhotoIndex(-1);
  }

  function goPrevPhoto() {
    setActivePhotoIndex((current) => (current > 0 ? current - 1 : current));
  }

  function goNextPhoto() {
    setActivePhotoIndex((current) =>
      current < photos.length - 1 ? current + 1 : current
    );
  }

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
                      onChange={(event) => setUploadNewFolder(event.target.value)}
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
              Segure uma foto ou pasta (ou clique com botao direito) para abrir opcoes de exclusao.
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
                        onTouchStart={() => startLongPress(() => openFolderActions(folder))}
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
                          <p className="truncate text-sm font-medium">{folder.label}</p>
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
                          setActivePhotoIndex(index);
                        }}
                        onContextMenu={(event) => {
                          if (!canUpload) return;
                          event.preventDefault();
                          openPhotoActionsAt(photo, {
                            x: event.clientX,
                            y: event.clientY,
                          });
                        }}
                        onTouchStart={() => startLongPress(() => openPhotoActions(photo))}
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
                      <p className="text-xs text-white/45">Atualizando galeria...</p>
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
        <div className="fixed inset-0 z-50 bg-black/90">
          <button
            type="button"
            onClick={closePreview}
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 p-2 text-white/90 transition-colors hover:bg-black/70"
          >
            <X size={20} />
          </button>

          <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-4 py-14">
            <button
              type="button"
              onClick={goPrevPhoto}
              disabled={activePhotoIndex <= 0}
              className="mr-3 hidden rounded-full border border-white/20 bg-black/40 p-2 text-white/90 transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-35 md:block"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black/25">
              <div
                ref={previewFrameRef}
                className="relative flex h-[72vh] items-center justify-center overflow-hidden"
                onTouchStart={handlePreviewTouchStart}
                onTouchMove={handlePreviewTouchMove}
                onTouchEnd={handlePreviewTouchEnd}
                onTouchCancel={handlePreviewTouchEnd}
                style={{ touchAction: "none" }}
              >
                <img
                  src={activePhoto.url}
                  alt={activePhoto.folderLabel || "Preview da foto"}
                  draggable={false}
                  onDragStart={(event) => event.preventDefault()}
                  className="max-h-[72vh] w-full select-none object-contain"
                  style={{
                    transform: `translate3d(${previewOffset.x}px, ${previewOffset.y}px, 0) scale(${previewScale})`,
                    transformOrigin: "center center",
                    transition: isPreviewInteracting
                      ? "none"
                      : "transform 120ms ease-out",
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3 text-sm text-white/75">
                <span>{activePhoto.folderLabel || "Geral"}</span>
                <span className="text-xs md:text-sm">
                  {formatDate(activePhoto.createdAt)}
                </span>
                <span className="w-full text-[11px] text-white/55 md:w-auto">
                  Pinça para zoom, arraste para mover e deslize para trocar.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={goNextPhoto}
              disabled={activePhotoIndex >= photos.length - 1}
              className="ml-3 hidden rounded-full border border-white/20 bg-black/40 p-2 text-white/90 transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-35 md:block"
            >
              <ChevronRight size={20} />
            </button>
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
