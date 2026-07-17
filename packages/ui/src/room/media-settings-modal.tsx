"use client";

import { useEffect, useState } from "react";

import { Button } from "../components/button";

export interface MediaSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

async function listDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return { cameras: [] as MediaDeviceInfo[], mics: [] as MediaDeviceInfo[], speakers: [] as MediaDeviceInfo[] };
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  return {
    cameras: devices.filter((device) => device.kind === "videoinput"),
    mics: devices.filter((device) => device.kind === "audioinput"),
    speakers: devices.filter((device) => device.kind === "audiooutput"),
  };
}

export function MediaSettingsModal({ open, onClose }: MediaSettingsModalProps) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [micId, setMicId] = useState("");
  const [speakerId, setSpeakerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    void listDevices()
      .then((devices) => {
        setCameras(devices.cameras);
        setMics(devices.mics);
        setSpeakers(devices.speakers);
        setCameraId(devices.cameras[0]?.deviceId ?? "");
        setMicId(devices.mics[0]?.deviceId ?? "");
        setSpeakerId(devices.speakers[0]?.deviceId ?? "");
      })
      .catch(() => {
        setError("Could not list media devices. Check browser permissions.");
      });
  }, [open]);

  if (!open) {
    return null;
  }

  const apply = async () => {
    setError(null);
    setSaved(false);
    try {
      localStorage.setItem(
        "corgi.mediaDevices",
        JSON.stringify({ cameraId, micId, speakerId }),
      );
      setSaved(true);
    } catch {
      setError("Could not save device preferences.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Media settings"
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button type="button" className="text-slate-400 hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-slate-300">
            Camera
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={cameraId}
              onChange={(event) => setCameraId(event.target.value)}
            >
              {cameras.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Microphone
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={micId}
              onChange={(event) => setMicId(event.target.value)}
            >
              {mics.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Mic ${device.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Speakers
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={speakerId}
              onChange={(event) => setSpeakerId(event.target.value)}
            >
              {speakers.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${device.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        {saved ? (
          <p className="mt-3 text-sm text-emerald-400">
            Preferences saved. They apply on the next media reconnect.
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={() => void apply()}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
