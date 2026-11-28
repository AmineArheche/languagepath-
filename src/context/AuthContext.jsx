/**
 * src/context/AuthContext.jsx
 *
 * User Authentication, Multi-Language Profile, and Session Management.
 * Supports:
 * - Real client-side registration & login (stored safely in localStorage)
 * - 1-Click Instant Demo User ("Amine")
 * - Enrolled target languages (multi-language tracking: DE, FR, ES, EN, AR, IT)
 * - Per-language progress storage (XP, streak, level, words learned, retention)
 * - Seamless language switching
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SUPPORTED_TARGET_LANGUAGES, getLanguageById } from "../data/languages";
import {
  seedDemoUserIfEmpty,
  dbRegisterUser,
  dbLoginUser,
  dbUpdateUser,
  dbGetAllUserLanguageProgresses,
  dbSaveUserProgress,
  DEFAULT_DEMO_USER_ID,
  INITIAL_DEMO_USER,
  INITIAL_DEMO_PROGRESS_MAP
} from "../storage/db";

const AuthContext = createContext();

const STORAGE_KEY_USERS = "deutschpath_users_v2";
const STORAGE_KEY_CURRENT_USER = "deutschpath_current_user_v2";
const STORAGE_KEY_LANG_PROGRESS = "deutschpath_languages_progress_v2";

const DEFAULT_DEMO_LANGUAGES_PROGRESS = INITIAL_DEMO_PROGRESS_MAP;
const DEMO_USER = INITIAL_DEMO_USER;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) return JSON.parse(saved);
      return DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  });

  const [languagesProgress, setLanguagesProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG_PROGRESS);
      if (saved) return JSON.parse(saved);
      return DEFAULT_DEMO_LANGUAGES_PROGRESS;
    } catch {
      return DEFAULT_DEMO_LANGUAGES_PROGRESS;
    }
  });

  const [authError, setAuthError] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // "login" | "signup"

  // On mount and user change: seed demo user in IndexedDB and load actual progress from DB
  useEffect(() => {
    let active = true;
    seedDemoUserIfEmpty().then(async () => {
      if (!active) return;
      if (user?.id) {
        try {
          const records = await dbGetAllUserLanguageProgresses(user.id);
          if (active && Array.isArray(records) && records.length > 0) {
            const map = {};
            records.forEach((r) => {
              if (r.languageId) map[r.languageId] = r;
            });
            setLanguagesProgress((prev) => ({ ...prev, ...map }));
          }
        } catch (e) {
          console.warn("Could not load language progresses from IndexedDB:", e);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Save current user to localStorage cache on change
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch {}
  }, [user]);

  // Save languages progress to localStorage cache on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG_PROGRESS, JSON.stringify(languagesProgress));
    } catch {}
  }, [languagesProgress]);

  /**
   * Login with email and password verified via IndexedDB
   */
  const login = useCallback(async (email, password) => {
    setAuthError("");
    const cleanEmail = (email || "").toLowerCase().trim();

    try {
      // 1. Try real IndexedDB login
      const dbUser = await dbLoginUser(cleanEmail, password);
      if (dbUser) {
        setUser(dbUser);
        setIsAuthModalOpen(false);
        return { success: true, user: dbUser };
      }
    } catch (dbErr) {
      // If error specifically says wrong password or user not found, surface it
      if (dbErr.message?.includes("Mot de passe") || dbErr.message?.includes("Aucun compte")) {
        setAuthError(dbErr.message);
        return { success: false, error: dbErr.message };
      }
    }

    // 2. Synchronous fallback check (Demo user or localStorage)
    if (cleanEmail === DEMO_USER.email.toLowerCase()) {
      setUser(DEMO_USER);
      setIsAuthModalOpen(false);
      return { success: true, user: DEMO_USER };
    }

    try {
      const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
      const users = usersStr ? JSON.parse(usersStr) : [DEMO_USER];
      const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        setAuthError("Aucun compte trouvé avec cette adresse email.");
        return { success: false, error: "Aucun compte trouvé." };
      }
      if (found.password && found.password !== password) {
        setAuthError("Mot de passe incorrect.");
        return { success: false, error: "Mot de passe incorrect." };
      }
      setUser(found);
      setIsAuthModalOpen(false);
      return { success: true, user: found };
    } catch (err) {
      setAuthError("Erreur de connexion.");
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Register a new user saved directly in IndexedDB
   */
  const signup = useCallback(async ({ name, email, password, nativeLanguage = "fr", targetLanguage = "de" }) => {
    setAuthError("");
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      setAuthError("Veuillez renseigner tous les champs obligatoires.");
      return { success: false, error: "Champs incomplets." };
    }

    try {
      // 1. Save to real IndexedDB database
      const newUser = await dbRegisterUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        nativeLanguage,
        activeTargetLanguage: targetLanguage,
        enrolledLanguages: [targetLanguage]
      });

      // 2. Update localStorage cache as well
      try {
        const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
        const users = usersStr ? JSON.parse(usersStr) : [DEMO_USER];
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      } catch {}

      // 3. Initialize progress container for target language
      setLanguagesProgress((prev) => ({
        ...prev,
        [targetLanguage]: {
          xp: 50,
          streak: 1,
          level: "A1",
          wordsLearned: 15,
          retentionRate: 100,
          studyMinutes: 15,
          completedLessons: [],
          completedLessonsCount: 1,
          lastActiveDate: new Date().toISOString().split("T")[0]
        }
      }));

      setUser(newUser);
      setIsAuthModalOpen(false);
      return { success: true, user: newUser };
    } catch (err) {
      setAuthError(err.message || "Erreur lors de la création du compte.");
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * 1-Click Instant Login as Demo User
   */
  const loginAsDemo = useCallback(() => {
    setAuthError("");
    setUser(DEMO_USER);
    setIsAuthModalOpen(false);
    return { success: true, user: DEMO_USER };
  }, []);

  /**
   * Log out
   */
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * Update Profile details in state and IndexedDB
   */
  const updateProfile = useCallback(async (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (prev.id) {
        dbUpdateUser(prev.id, updates).catch(() => {});
      }
      return updated;
    });
  }, []);

  /**
   * Switch the active target language
   */
  const switchTargetLanguage = useCallback((langId) => {
    if (!langId) return;
    setUser((prev) => {
      if (!prev) return null;
      const enrolled = prev.enrolledLanguages?.includes(langId)
        ? prev.enrolledLanguages
        : [...(prev.enrolledLanguages || []), langId];

      const updated = {
        ...prev,
        activeTargetLanguage: langId,
        enrolledLanguages: enrolled
      };

      if (prev.id) {
        dbUpdateUser(prev.id, { activeTargetLanguage: langId, enrolledLanguages: enrolled }).catch(() => {});
      }

      return updated;
    });

    // Ensure progress container exists for this language
    setLanguagesProgress((prev) => {
      if (prev[langId]) return prev;
      return {
        ...prev,
        [langId]: {
          xp: 0,
          streak: 1,
          level: "A1",
          wordsLearned: 0,
          retentionRate: 100,
          studyMinutes: 0,
          completedLessons: [],
          completedLessonsCount: 0,
          lastActiveDate: new Date().toISOString().split("T")[0]
        }
      };
    });
  }, []);

  /**
   * Update progress metrics for a specific language in state and IndexedDB
   */
  const updateLanguageProgress = useCallback((langId, progressUpdates) => {
    if (!langId) return;
    setLanguagesProgress((prev) => {
      const current = prev[langId] || {
        xp: 0,
        streak: 1,
        level: "A1",
        wordsLearned: 0,
        retentionRate: 100,
        studyMinutes: 0,
        completedLessons: [],
        completedLessonsCount: 0,
        lastActiveDate: new Date().toISOString().split("T")[0]
      };

      const safeUpdates = { ...progressUpdates };
      if (safeUpdates.completedLessons !== undefined && !Array.isArray(safeUpdates.completedLessons)) {
        safeUpdates.completedLessonsCount = safeUpdates.completedLessons;
        delete safeUpdates.completedLessons;
      }

      const merged = {
        ...current,
        ...safeUpdates,
        completedLessons: Array.isArray(safeUpdates.completedLessons)
          ? safeUpdates.completedLessons
          : (Array.isArray(current.completedLessons) ? current.completedLessons : []),
        lastActiveDate: new Date().toISOString().split("T")[0]
      };

      if (user?.id) {
        dbSaveUserProgress(user.id, langId, merged).catch(() => {});
      }

      return {
        ...prev,
        [langId]: merged
      };
    });
  }, [user?.id]);

  /**
   * Enroll in a new target language
   */
  const enrollNewLanguage = useCallback((langId) => {
    switchTargetLanguage(langId);
  }, [switchTargetLanguage]);

  /**
   * Add XP to current or specific language
   */
  const addLanguageXp = useCallback((amount = 10, langId = null) => {
    const targetLang = langId || user?.activeTargetLanguage || "de";
    setLanguagesProgress((prev) => {
      const current = prev[targetLang] || {
        xp: 0,
        streak: 1,
        level: "A1",
        wordsLearned: 0,
        retentionRate: 100,
        studyMinutes: 0,
        completedLessons: [],
        completedLessonsCount: 0,
        lastActiveDate: new Date().toISOString().split("T")[0]
      };
      return {
        ...prev,
        [targetLang]: {
          ...current,
          xp: current.xp + amount,
          lastActiveDate: new Date().toISOString().split("T")[0]
        }
      };
    });
  }, [user?.activeTargetLanguage]);

  /**
   * Get full details of active target language
   */
  const activeLanguageDetails = getLanguageById(user?.activeTargetLanguage || "de");

  /**
   * Get list of full language objects user is enrolled in
   */
  const enrolledLanguagesList = (user?.enrolledLanguages || ["de"]).map((id) => getLanguageById(id));

  /**
   * Get list of available languages user has not yet enrolled in
   */
  const availableLanguagesToEnroll = SUPPORTED_TARGET_LANGUAGES.filter(
    (l) => !(user?.enrolledLanguages || []).includes(l.id)
  );

  /**
   * Calculate global statistics across all languages
   */
  const globalStats = {
    totalXp: Object.values(languagesProgress).reduce((acc, p) => acc + (p.xp || 0), 0),
    maxStreak: Math.max(...Object.values(languagesProgress).map((p) => p.streak || 0), user?.streak || 1),
    totalWordsLearned: Object.values(languagesProgress).reduce((acc, p) => acc + (p.wordsLearned || 0), 0),
    totalLanguages: user?.enrolledLanguages?.length || 1
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isDemoUser: user?.id === DEMO_USER.id,
        activeTargetLanguage: user?.activeTargetLanguage || "de",
        activeLanguageDetails,
        enrolledLanguagesList,
        availableLanguagesToEnroll,
        languagesProgress,
        globalStats,
        authError,
        isAuthModalOpen,
        authModalMode,
        openAuthModal: (mode = "login") => {
          setAuthModalMode(mode);
          setAuthError("");
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        signup,
        loginAsDemo,
        logout,
        updateProfile,
        switchTargetLanguage,
        enrollNewLanguage,
        addLanguageXp,
        updateLanguageProgress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      isDemoUser: false,
      activeTargetLanguage: "de",
      languagesProgress: {},
      enrolledLanguagesList: [],
      availableLanguagesToEnroll: [],
      globalStats: { totalXp: 0, maxStreak: 1, totalWordsLearned: 0, totalLanguages: 1 },
      updateLanguageProgress: () => {}
    };
  }
  return context;
}
