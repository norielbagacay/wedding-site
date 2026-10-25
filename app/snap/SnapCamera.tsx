"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { applyPhotoFilter, PHOTO_FILTERS, type PhotoFilter } from "../lib/photo";
import { addPhotoFrame, getFrameLayout, PHOTO_FRAMES, type PhotoFrame } from "../lib/photo-frame";
import { coupleNames, wedding } from "../content";
import { BOOTH_LAYOUTS, composeBoothPhotos, getBoothGeometry, type BoothLayout } from "../lib/photo-booth";
import { isPhonePhotoSaving } from "../lib/photo-saving";
import styles from "./Snap.module.css";

type Facing = "user" | "environment";
type Photo = { url: string; file: File; downloadRequested: boolean; mobile: boolean; nativeShare: boolean; width: number; height: number };

export function SnapCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const renderRef = useRef(0);
  const originalRef = useRef<HTMLCanvasElement | null>(null);
  const shotsRef = useRef<HTMLCanvasElement[]>([]);
  const [shotPreviews, setShotPreviews] = useState<string[]>([]);
  const [booth, setBooth] = useState<BoothLayout>(BOOTH_LAYOUTS[0]);
  const [facing, setFacing] = useState<Facing>("environment");
  const [filter, setFilter] = useState<PhotoFilter>(PHOTO_FILTERS[0]);
  const [frame, setFrame] = useState<PhotoFrame>(PHOTO_FRAMES[0]);
  const [videoSize, setVideoSize] = useState({ width: 1440, height: 1920 });
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<Photo | null>(null);

  useEffect(() => () => {
    requestRef.current++;
    renderRef.current++;
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!photo) return;
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
    setReady(false);
  }, []);

  const closeCamera = useCallback(() => {
    requestRef.current++;
    stopCamera();
    setBusy(false);
  }, [stopCamera]);

  useEffect(() => {
    if (!active) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCamera();
      }
      if (event.key === "Tab") {
        const controls = overlayRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [active, closeCamera]);

  async function startCamera(nextFacing: Facing = facing) {
    const request = ++requestRef.current;
    setError("");
    setBusy(true);
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable here. Open this page over HTTPS, or choose a photo below.");
      setBusy(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nextFacing },
        },
        audio: false,
      });
      if (request !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        return;
      }
      video.srcObject = stream;
      await video.play();
      if (request !== requestRef.current) return;
      setFacing(nextFacing);
      setActive(true);
      setReady(video.readyState >= 2);
    } catch (cause) {
      if (request !== requestRef.current) return;
      stopCamera();
      const name = cause instanceof DOMException ? cause.name : "";
      setError(name === "NotAllowedError"
        ? "Camera access was declined. Allow camera access in your browser settings and try again, or choose a photo below."
        : "We couldn't open your camera. Please try again or choose a photo below.");
    } finally {
      if (request === requestRef.current) setBusy(false);
    }
  }

  function renderPhoto(original: HTMLCanvasElement, selected: PhotoFilter, autoDownload = false, selectedFrame: PhotoFrame = frame) {
    const render = ++renderRef.current;
    setProcessing(true);
    const canvas = document.createElement("canvas");
    canvas.width = original.width;
    canvas.height = original.height;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Your browser couldn't prepare this photo. Please try again.");
      setProcessing(false);
      return;
    }
    context.drawImage(original, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    applyPhotoFilter(pixels.data, selected);
    context.putImageData(pixels, 0, 0);
    let output: HTMLCanvasElement;
    try {
      output = addPhotoFrame(canvas, selectedFrame, wedding.hashtags, coupleNames);
    } catch {
      setProcessing(false);
      setError("We couldn't prepare your frame. Please try again.");
      return;
    }
    output.toBlob((blob) => {
      if (render !== renderRef.current) return;
      setProcessing(false);
      if (!blob) {
        setError("Your photo couldn't be saved. Please try again.");
        return;
      }
      const file = new File([blob], `genesis-rosher-${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const mobile = isPhonePhotoSaving(navigator.userAgent, navigator.maxTouchPoints);
      let nativeShare = false;
      try { nativeShare = Boolean(navigator.canShare?.({ files: [file] })); } catch {}
      const downloadRequested = autoDownload && !mobile;
      setPhoto({ url, file, downloadRequested, mobile, nativeShare, width: output.width, height: output.height });
      if (downloadRequested) {
        // Request a download once per capture; edits keep the manual save action.
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.hidden = true;
        document.body.appendChild(link);
        try {
          link.click();
        } catch {
          setError("Please tap Save photo to download your picture.");
        } finally {
          link.remove();
        }
      }
    }, "image/jpeg", 0.92);
  }

  function resetShots() {
    renderRef.current++;
    shotsRef.current = [];
    originalRef.current = null;
    setShotPreviews([]);
    setPhoto(null);
    setProcessing(false);
    setError("");
  }

  function selectLayout(selected: BoothLayout) {
    if (selected.id === booth.id) return;
    resetShots();
    setBooth(selected);
  }

  function addShot(canvas: HTMLCanvasElement, autoDownload: boolean) {
    if (shotsRef.current.length >= booth.count) return;
    shotsRef.current.push(canvas);
    const thumbnail = document.createElement("canvas");
    thumbnail.width = 160;
    thumbnail.height = Math.max(1, Math.round(160 * canvas.height / canvas.width));
    thumbnail.getContext("2d")?.drawImage(canvas, 0, 0, thumbnail.width, thumbnail.height);
    const preview = thumbnail.toDataURL("image/jpeg", 0.7);
    setShotPreviews((previous) => [...previous, preview]);
    if (shotsRef.current.length === booth.count) {
      try {
        const sheet = composeBoothPhotos(shotsRef.current, booth);
        originalRef.current = sheet;
        renderPhoto(sheet, filter, autoDownload);
        stopCamera();
      } catch {
        setError("We couldn't prepare your photo sheet. Please start a new set.");
      }
    }
  }

  function updateVideoSize() {
    const video = videoRef.current;
    if (video?.videoWidth && video.videoHeight) {
      setVideoSize({ width: video.videoWidth, height: video.videoHeight });
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !ready || processing || shotsRef.current.length >= booth.count || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    const crop = { x: 0, y: 0, width: video.videoWidth, height: video.videoHeight };
    const scale = Math.min(1, 1600 / Math.max(crop.width, crop.height));
    canvas.width = Math.round(crop.width * scale);
    canvas.height = Math.round(crop.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return;
    if (facing === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
    addShot(canvas, true);
  }

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    const request = ++requestRef.current;
    stopCamera();
    if (shotsRef.current.length >= booth.count) resetShots();
    setBusy(true);
    setError("");
    try {
      for (const file of files.slice(0, booth.count - shotsRef.current.length)) {
        const url = URL.createObjectURL(file);
        try {
          const image = new window.Image();
          image.src = url;
          await image.decode();
          if (request !== requestRef.current) return;
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
          canvas.width = Math.round(image.naturalWidth * scale);
          canvas.height = Math.round(image.naturalHeight * scale);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas unavailable");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          addShot(canvas, false);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    } catch {
      if (request === requestRef.current) setError("We couldn't open that image. Try a JPEG or PNG photo.");
    } finally {
      if (request === requestRef.current) setBusy(false);
    }
  }

  function selectFilter(selected: PhotoFilter) {
    setFilter(selected);
    if (originalRef.current) renderPhoto(originalRef.current, selected);
  }

  function selectFrame(selected: PhotoFrame) {
    setFrame(selected);
    if (originalRef.current) renderPhoto(originalRef.current, filter, false, selected);
  }

  function retake() {
    resetShots();
    void startCamera();
  }

  async function sharePhoto() {
    if (!photo) return;
    setError("");
    try {
      if (navigator.canShare?.({ files: [photo.file] })) {
        await navigator.share({ files: [photo.file], title: "Our wedding memory" });
      } else {
        setError(photo.mobile ? "Tap Open photo, then press and hold the image to see your phone's save options." : "Save your photo first, then share it from your photo library.");
      }
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === "AbortError")) {
        setError(photo.mobile ? "Your phone could not open the save menu. Tap Open photo, then press and hold the image to save it." : "Please save your photo and share it from your photo library.");
      }
    }
  }

  const crop = videoSize;
  const boothGeometry = getBoothGeometry(crop.width, crop.height, booth);
  const frameOptions = PHOTO_FRAMES.map((item) => {
    const thumbnail = getFrameLayout(boothGeometry.width, boothGeometry.height, item);
    const scale = Math.min(3.6 / thumbnail.width, 5.2 / thumbnail.height);
    return { ...item, previewWidth: thumbnail.width * scale, previewHeight: thumbnail.height * scale };
  });

  return (
    <section className={styles.camera} aria-label="Wedding photo camera">
      <div ref={overlayRef} className={active ? styles.cameraOverlay : styles.cameraStage}
        role={active ? "dialog" : undefined} aria-modal={active ? true : undefined} aria-label={active ? "Camera" : undefined}>
        {active && (
          <div className={styles.cameraTopbar}>
            <button ref={closeRef} type="button" onClick={closeCamera} aria-label="Close camera">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              Close
            </button>
            <p>{booth.count > 1 ? `Photo ${Math.min(shotPreviews.length + 1, booth.count)} of ${booth.count}` : "Wedding camera"}</p>
            <span aria-hidden="true" />
          </div>
        )}
      {!photo && booth.count > 1 && (
        <p className={styles.shotStatus} role="status">Photo {Math.min(shotPreviews.length + 1, booth.count)} of {booth.count}. Take a new pose for each shot.</p>
      )}
      <div className={styles.cameraViewport} style={{ "--view-ratio": crop.width / crop.height } as CSSProperties}>
      <div className={styles.preview} data-idle={!active && !photo} aria-busy={busy || processing}
        style={{ aspectRatio: photo ? photo.width / photo.height : active ? crop.width / crop.height : "3 / 4", maxHeight: photo ? "75svh" : undefined }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          hidden={Boolean(photo) || !active}
          onLoadedMetadata={updateVideoSize}
          onResize={updateVideoSize}
          onLoadedData={() => { setReady(true); updateVideoSize(); }}
          aria-label="Live camera preview"
          style={{
            filter: filter.css,
            transform: facing === "user" ? "scaleX(-1)" : undefined,
            objectFit: "contain",
          }}
        />
        {photo && <Image src={photo.url} alt="Your wedding photo with the selected filter and frame" fill unoptimized sizes="(max-width: 640px) 100vw, 512px" className={styles.captured} />}
        {!active && !photo && (
          <div className={styles.empty}>
            {(busy || processing) && <p role="status">{busy ? "Opening your camera..." : "Preparing your photo..."}</p>}
            {!busy && !processing && (
              <button className={styles.primary} onClick={() => void startCamera()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m8 5 1.5-2h5L16 5h3a2 2 0 0 1 2 2v12H3V7a2 2 0 0 1 2-2h3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Enable Camera
              </button>
            )}
            <p>Camera access starts when you choose.</p>
          </div>
        )}
      </div>
      </div>
      {active && (
        <fieldset className={styles.liveLooks}>
          <legend className={styles.srOnly}>Camera filters</legend>
          {PHOTO_FILTERS.map((item) => <button key={item.id} type="button" aria-pressed={filter.id === item.id} onClick={() => selectFilter(item)}>{item.name}</button>)}
        </fieldset>
      )}
      <div className={styles.actions}>
        {photo ? (
          <>
            {photo.mobile ? (
              <>
                {photo.nativeShare
                  ? <button className={styles.primary} disabled={processing} onClick={() => void sharePhoto()}>Save to phone</button>
                  : null}
                <a href={photo.url} target="_blank" rel="noopener noreferrer" className={photo.nativeShare ? styles.secondary : styles.primary} aria-disabled={processing} onClick={(event) => { if (processing) event.preventDefault(); }}>Open photo</a>
              </>
            ) : (
              <>
                <a href={photo.url} download={photo.file.name} className={styles.primary} aria-disabled={processing} onClick={(event) => { if (processing) event.preventDefault(); }}>Save photo</a>
                <button className={styles.secondary} disabled={processing} onClick={() => void sharePhoto()}>Share photo</button>
              </>
            )}
            <button className={styles.textButton} disabled={processing} onClick={retake}>{booth.count > 1 ? "Start a new set" : "Take another"}</button>
          </>
        ) : active ? (
          <>
            <button className={`${styles.primary} ${styles.shutter}`} disabled={!ready || busy || processing} onClick={capture}><span className={styles.srOnly}>{booth.count > 1 ? `Take photo ${shotPreviews.length + 1} of ${booth.count}` : "Take photo"}</span></button>
            <button className={`${styles.secondary} ${styles.switchCamera}`} disabled={busy || processing} onClick={() => void startCamera(facing === "user" ? "environment" : "user")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 7h-6l2-2M4 17h6l-2 2M20 7a9 9 0 0 0-15 0M4 17a9 9 0 0 0 15 0M20 7v5M4 17v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className={styles.srOnly}>Switch camera</span>
            </button>
          </>
        ) : null}
      </div>
      </div>
      <div inert={active}>
      {booth.count > 1 && (
        <ol className={styles.shotTray} aria-label="Your photobooth shots" style={{ gridTemplateColumns: `repeat(${booth.count}, minmax(0, 1fr))` }}>
          {Array.from({ length: booth.count }, (_, index) => (
            <li key={index}>
              {shotPreviews[index]
                ? <Image src={shotPreviews[index]} alt={`Captured photo ${index + 1}`} width={160} height={160} unoptimized style={{ filter: filter.css }} />
                : <span>Photo {index + 1}</span>}
            </li>
          ))}
        </ol>
      )}
      <fieldset className={`${styles.filters} ${styles.layoutPicker}`}>
        <legend>Choose your photobooth layout</legend>
        <div>
          {BOOTH_LAYOUTS.map((item) => (
            <button key={item.id} type="button" aria-pressed={booth.id === item.id} disabled={busy || processing} onClick={() => selectLayout(item)}>
              <span className={styles.layoutIcon} aria-hidden="true" style={{ gridTemplateColumns: `repeat(${item.columns}, 1fr)` }}>
                {Array.from({ length: item.count }, (_, index) => <span key={index} />)}
              </span>
              {item.name}
            </button>
          ))}
        </div>
        <p className={styles.note}>Changing the layout starts a new set.</p>
      </fieldset>
      <fieldset className={`${styles.filters} ${styles.lookPicker}`}>
        <legend>Choose your look</legend>
        <div>
          {PHOTO_FILTERS.map((item) => (
            <button key={item.id} type="button" aria-pressed={filter.id === item.id} disabled={processing} onClick={() => selectFilter(item)}>
              <span className={styles.filterThumb} aria-hidden="true" style={{ filter: item.css }} />
              <span className={styles.cardLabel}>{item.name}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={`${styles.filters} ${styles.framePicker}`}>
        <legend>Choose your frame</legend>
        <div>
          {frameOptions.map((item) => (
            <button key={item.id} type="button" aria-pressed={frame.id === item.id} disabled={processing} onClick={() => selectFrame(item)}>
              <span className={styles.frameThumb} data-frame={item.id} aria-hidden="true" style={{ "--frame-color": item.background } as CSSProperties}>
                <span className={styles.miniStrip} style={{
                  gridTemplateRows: `repeat(${booth.rows}, 1fr)`,
                  gridTemplateColumns: `repeat(${booth.columns}, 1fr)`,
                  width: `${item.previewWidth}rem`,
                  height: `${item.previewHeight}rem`,
                }}>
                  {Array.from({ length: booth.count }, (_, index) => <span key={index} />)}
                </span>
              </span>
              <span className={styles.cardLabel}>{item.name}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className={styles.orDivider} aria-hidden="true">Or</div>
      <label className={styles.filePicker}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <path d="m4 18 6-7 4 4 3-3 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        Choose a photo from your device
        <input type="file" accept="image/*" multiple={booth.count > 1} disabled={busy || processing} onChange={(event) => void choosePhoto(event)} />
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.note} role="status" aria-live="polite">
        {processing ? "Preparing your photo..." : photo
          ? photo.mobile
            ? photo.nativeShare
              ? "Tap Save to phone, then choose Save Image or your photo app if offered."
              : "Tap Open photo, then press and hold the image to see your phone's save options."
            : photo.downloadRequested
            ? "Download requested. Check your downloads, or tap Save photo if it did not start."
            : "Your photo is ready. Tap Save photo to keep this version."
          : <><svg width="12" height="15" viewBox="0 0 12 15" fill="none" aria-hidden="true"><rect x="1" y="6" width="10" height="8" rx="1.5" fill="currentColor" /><path d="M3 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" /><circle cx="6" cy="10" r="1" fill="#f8eee2" /></svg>Camera access and photo downloads start only when you choose.</>}
      </p>
      {photo?.mobile && <p className={styles.note}>Saving to Photos or Gallery needs your confirmation. The available save options depend on your phone.</p>}
      </div>
    </section>
  );
}