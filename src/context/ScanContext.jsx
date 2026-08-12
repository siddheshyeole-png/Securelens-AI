import React, { createContext, useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { detectionService } from "../services/detectionService";

export const ScanContext = createContext();

export const ScanProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.email || user?.id || "guest_user";

  const [scans, setScans] = useState(() => {
    try {
      const saved = localStorage.getItem(`securelens_scans_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sort newest first
          return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
      }
    } catch (e) {
      console.warn("Failed to load user scans from localStorage", e);
    }
    return [];
  });

  const [activeScan, setActiveScan] = useState(() => scans[0] || null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analysisState, setAnalysisState] = useState("IDLE");
  const [statusMessage, setStatusMessage] = useState("");
  const [validationError, setValidationError] = useState(null);
  const scanInFlightRef = useRef(false);

  // Fetch persistent detection history from backend REST API
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const apiUrl = import.meta.env.VITE_DETECTION_API_URL || "/api/analyze";
        const historyUrl = apiUrl.replace(/\/analyze\/?$/, "/history");

        const res = await fetch(`${historyUrl}?userId=${encodeURIComponent(userId)}`, {
          headers: { "x-user-id": userId }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.history) && isMounted) {
            setScans((prev) => {
              const prevMap = new Map(prev.map((s) => [s.id || s.detectionId, s]));
              return data.history.map((rec) => {
                const match = prevMap.get(rec.id || rec.detectionId);
                return {
                  ...rec,
                  previewUrl: rec.previewUrl || match?.previewUrl || null
                };
              });
            });
            if (data.history.length > 0) {
              setActiveScan((prevActive) => {
                const match = data.history.find((h) => h.id === prevActive?.id || h.detectionId === prevActive?.id);
                return match
                  ? { ...match, previewUrl: match.previewUrl || prevActive?.previewUrl || null }
                  : data.history[0];
              });
            }
            return;
          }
        }
      } catch (e) {
        console.warn("Backend history fetch failed, relying on local cache:", e.message);
      }

      // Fallback to localStorage cache
      try {
        const saved = localStorage.getItem(`securelens_scans_${userId}`);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sorted = parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setScans(sorted);
            setActiveScan(sorted[0]);
          }
        }
      } catch (e) {}
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Persist scans per user ID in localStorage cache
  useEffect(() => {
    try {
      if (userId && scans.length > 0) {
        localStorage.setItem(`securelens_scans_${userId}`, JSON.stringify(scans));
      }
    } catch (e) {
      console.error("Failed to persist user scans to localStorage", e);
    }
  }, [scans, userId]);

  const validateFile = (file, mediaCategory) => {
    setValidationError(null);
    const result = detectionService.validateFile(file, mediaCategory);
    if (!result.valid) {
      setValidationError(result.error);
      return false;
    }
    return true;
  };

  const runScan = async ({ file, fileName, fileType }) => {
    // Synchronous guard — prevents duplicate requests even on rapid double-clicks
    if (scanInFlightRef.current) {
      return Promise.reject(new Error("Analysis already in progress."));
    }
    scanInFlightRef.current = true;

    setIsScanning(true);
    setScanProgress(0);
    setValidationError(null);
    setAnalysisState("UPLOADING");

    try {
      const result = await detectionService.analyzeMedia({
        file,
        fileName,
        mediaType: fileType,
        userId,
        onProgress: ({ stage, progress, message }) => {
          setAnalysisState(stage);
          setScanProgress(progress);
          setStatusMessage(message);
        }
      });

      const userRecord = {
        ...result,
        userId,
        previewUrl: result.previewUrl || (file ? URL.createObjectURL(file) : null),
        fileSize: file?.size || result.fileSize || 0
      };

      setScans((prev) => [userRecord, ...prev]);
      setActiveScan(userRecord);
      setAnalysisState("COMPLETED");
      return userRecord;
    } catch (err) {
      setAnalysisState("FAILED");
      setValidationError(err.message || "Media analysis failed. Please try again.");
      throw err;
    } finally {
      scanInFlightRef.current = false;
      setIsScanning(false);
    }
  };

  const selectScanReport = (scanId) => {
    const found = scans.find((s) => s.id === scanId);
    if (found) {
      setActiveScan(found);
    }
  };

  const deleteScanReport = async (scanId) => {
    try {
      const apiUrl = import.meta.env.VITE_DETECTION_API_URL || "/api/analyze";
      const historyUrl = apiUrl.replace(/\/analyze\/?$/, "/history");
      fetch(`${historyUrl}/${encodeURIComponent(scanId)}`, {
        method: "DELETE",
        headers: { "x-user-id": userId }
      }).catch((e) => console.warn("Backend report deletion failed:", e.message));
    } catch (e) {}

    setScans((prev) => {
      const updated = prev.filter((s) => s.id !== scanId && s.detectionId !== scanId);
      if (activeScan?.id === scanId && updated.length > 0) {
        setActiveScan(updated[0]);
      } else if (updated.length === 0) {
        setActiveScan(null);
      }
      return updated;
    });
  };

  return (
    <ScanContext.Provider
      value={{
        scans,
        activeScan,
        isScanning,
        scanProgress,
        analysisState,
        statusMessage,
        validationError,
        validateFile,
        runScan,
        selectScanReport,
        deleteScanReport,
        setAnalysisState
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};
