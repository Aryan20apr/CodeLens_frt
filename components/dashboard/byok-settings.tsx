"use client";

import { useEffect, useState, useCallback, useId, useRef, useMemo } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  AlertTriangle,
  Sparkles,
  Zap,
  Cpu,
  Bot,
  BrainCircuit,
  Eye,
  EyeOff,
  RefreshCw,
  Server,
  Sliders,
  Layers,
  ArrowRight,
  ExternalLink,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import {
  fetchProviderKeys,
  fetchActiveProvider,
  saveProviderKey,
  deleteProviderKey,
  fetchProviderModels,
  setActiveProvider,
  LlmProviderApiError,
} from "@/lib/llm-provider/llm-provider-api";
import type {
  LlmProvider,
  LlmProviderKey,
  ActiveProvider,
} from "@/lib/llm-provider/types";

export interface ProviderMeta {
  id: string;
  name: string;
  badge: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  showBaseUrl: boolean;
  docUrl: string;
  icon: typeof Sparkles;
}

export const KNOWN_PROVIDERS: ProviderMeta[] = [
  {
    id: "NVIDIA",
    name: "NVIDIA NIM",
    badge: "Enterprise APIs",
    description: "Hosted microservices with support for customizable base URLs.",
    color: "#84cc16",
    borderColor: "rgba(132, 204, 22, 0.3)",
    bgColor: "rgba(132, 204, 22, 0.08)",
    showBaseUrl: true,
    docUrl: "https://build.nvidia.com/",
    icon: Cpu,
  },
  {
    id: "GROQ",
    name: "Groq LPU",
    badge: "Ultra Low Latency",
    description: "Lightning-fast inference on Llama 3, Mixtral, and Gemma.",
    color: "#fb923c",
    borderColor: "rgba(251, 146, 60, 0.3)",
    bgColor: "rgba(251, 146, 60, 0.08)",
    showBaseUrl: false,
    docUrl: "https://console.groq.com/keys",
    icon: Zap,
  },
  {
    id: "GEMINI",
    name: "Google Gemini",
    badge: "Multimodal & Reasoning",
    description: "Gemini 2.5 Pro, Flash, and specialized reasoning models.",
    color: "#60a5fa",
    borderColor: "rgba(96, 165, 250, 0.3)",
    bgColor: "rgba(96, 165, 250, 0.08)",
    showBaseUrl: false,
    docUrl: "https://aistudio.google.com/app/apikey",
    icon: Sparkles,
  },
  {
    id: "OPENAI",
    name: "OpenAI",
    badge: "GPT-4o & Reasoning",
    description: "State-of-the-art coding and reasoning with GPT-4o and o1 models.",
    color: "#10b981",
    borderColor: "rgba(16, 185, 129, 0.3)",
    bgColor: "rgba(16, 185, 129, 0.08)",
    showBaseUrl: true,
    docUrl: "https://platform.openai.com/api-keys",
    icon: Bot,
  },
  {
    id: "ANTHROPIC",
    name: "Anthropic",
    badge: "Claude 3.5 Models",
    description: "High-intelligence code generation and review with Claude 3.5 Sonnet.",
    color: "#f59e0b",
    borderColor: "rgba(245, 158, 11, 0.3)",
    bgColor: "rgba(245, 158, 11, 0.08)",
    showBaseUrl: false,
    docUrl: "https://console.anthropic.com/settings/keys",
    icon: BrainCircuit,
  },
];

export function getProviderMeta(providerId: string): ProviderMeta {
  const match = KNOWN_PROVIDERS.find(
    (p) => p.id.toUpperCase() === providerId.toUpperCase(),
  );
  if (match) return match;

  return {
    id: providerId.toUpperCase(),
    name: providerId,
    badge: "Custom Provider",
    description: "Custom or self-hosted LLM provider integration.",
    color: "#c0c1ff",
    borderColor: "rgba(192, 193, 255, 0.3)",
    bgColor: "rgba(192, 193, 255, 0.08)",
    showBaseUrl: true,
    docUrl: "",
    icon: Server,
  };
}

export function ByokSettings() {
  const [keys, setKeys] = useState<LlmProviderKey[]>([]);
  const [active, setActive] = useState<ActiveProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    const session = getAuthSession();
    if (!session?.accessToken) return;
    setLoading(true);
    setFetchError(null);
    try {
      const [keysData, activeData] = await Promise.all([
        fetchProviderKeys(session.accessToken),
        fetchActiveProvider(session.accessToken).catch(() => null),
      ]);
      setKeys(keysData);
      setActive(activeData);
    } catch (err) {
      setFetchError(
        err instanceof LlmProviderApiError
          ? err.message
          : "Failed to load LLM provider configuration.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleKeySaved(newKey: LlmProviderKey, models: string[]) {
    setKeys((prev) => {
      const exists = prev.some(
        (k) => k.provider.toUpperCase() === newKey.provider.toUpperCase(),
      );
      if (exists) {
        return prev.map((k) =>
          k.provider.toUpperCase() === newKey.provider.toUpperCase() ? newKey : k,
        );
      }
      return [...prev, newKey];
    });
    setAddModalOpen(false);

    // If no active provider was set, default to this newly configured one
    if (!active && models.length > 0) {
      setActive({ provider: newKey.provider, model: models[0] });
    }
  }

  function handleKeyDeleted(providerId: LlmProvider) {
    setKeys((prev) =>
      prev.filter((k) => k.provider.toUpperCase() !== providerId.toUpperCase()),
    );
    if (active?.provider.toUpperCase() === providerId.toUpperCase()) {
      setActive(null);
    }
  }

  if (loading) {
    return <ByokSkeleton />;
  }

  if (fetchError) {
    return <FetchErrorBanner message={fetchError} onRetry={loadData} />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Active Model Selector Bar / Banner */}
      <ActiveModelPanel
        keys={keys}
        active={active}
        onActiveChange={(updated) => setActive(updated)}
      />

      {/* Main BYOK Section */}
      <section aria-labelledby="byok-section-heading" className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "rgba(192,193,255,0.12)",
                color: "var(--primary)",
                border: "1px solid rgba(192,193,255,0.2)",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2
                id="byok-section-heading"
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "var(--font-geist-sans)", color: "var(--on-surface)" }}
              >
                Bring Your Own Key (BYOK)
              </h2>
              <p
                className="text-xs"
                style={{ fontFamily: "var(--font-inter)", color: "var(--on-surface-variant)" }}
              >
                Configure API keys for any model provider. Plaintext keys are encrypted at rest and never exposed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90 cursor-pointer"
              style={{
                background: "var(--surface-container)",
                border: "1px solid var(--primary)",
                color: "var(--primary)",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              <Plus size={14} />
              <span>Add Provider</span>
            </button>

            <button
              type="button"
              onClick={() => void loadData()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90 cursor-pointer"
              style={{
                background: "var(--surface-low)",
                border: "1px solid var(--outline-variant)",
                color: "var(--on-surface-variant)",
                fontFamily: "var(--font-space-grotesk)",
              }}
              title="Refresh keys status"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Configured Provider Cards Grid */}
        {keys.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {keys.map((keyItem) => {
              const meta = getProviderMeta(keyItem.provider);
              return (
                <ProviderCard
                  key={keyItem.provider}
                  meta={meta}
                  existingKey={keyItem}
                  isActiveProvider={
                    active?.provider.toUpperCase() === keyItem.provider.toUpperCase()
                  }
                  activeModel={
                    active?.provider.toUpperCase() === keyItem.provider.toUpperCase()
                      ? active.model
                      : null
                  }
                  onKeySaved={handleKeySaved}
                  onKeyDeleted={handleKeyDeleted}
                  onSelectAsActive={(provider, model) => {
                    setActive({ provider, model });
                  }}
                />
              );
            })}

            {/* Generic Add Provider Card in Grid */}
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl p-8 border-2 border-dashed transition-all duration-200 hover:border-indigo-400 group min-h-[260px] cursor-pointer"
              style={{
                borderColor: "rgba(144,143,160,0.25)",
                background: "rgba(28,27,29,0.3)",
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                style={{
                  background: "rgba(192,193,255,0.1)",
                  color: "var(--primary)",
                }}
              >
                <Plus size={22} />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                >
                  Add Model Provider
                </span>
                <span
                  className="text-xs max-w-[220px]"
                  style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
                >
                  Connect NVIDIA, Groq, Gemini, OpenAI, Anthropic, or custom endpoints
                </span>
              </div>
            </button>
          </div>
        ) : (
          /* Empty State when no keys exist */
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-2xl p-10 text-center"
            style={{
              background: "var(--surface-low)",
              border: "1px dashed var(--outline-variant)",
            }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(192,193,255,0.12)", color: "var(--primary)" }}
            >
              <Key size={26} />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h3
                className="font-bold text-base"
                style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
              >
                No LLM Provider Keys Configured
              </h3>
              <p
                className="text-xs"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
              >
                Bring your own API key for NVIDIA, Groq, Gemini, OpenAI, Anthropic, or custom endpoints to run code evaluations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 mt-2 cursor-pointer"
              style={{
                background: "var(--gradient-cta)",
                color: "#ffffff",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              <Plus size={16} />
              <span>Connect Your First Provider</span>
            </button>
          </div>
        )}
      </section>

      {/* Add Provider Modal */}
      <AddProviderModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        configuredKeys={keys}
        onKeySaved={handleKeySaved}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Active Model Control Panel
// ─────────────────────────────────────────────────────────────────

function ActiveModelPanel({
  keys,
  active,
  onActiveChange,
}: {
  keys: LlmProviderKey[];
  active: ActiveProvider | null;
  onActiveChange: (active: ActiveProvider) => void;
}) {
  const configuredProviders = useMemo(() => keys.map((k) => k.provider), [keys]);
  const [selectedProvider, setSelectedProvider] = useState<LlmProvider>(
    active?.provider ?? configuredProviders[0] ?? "NVIDIA",
  );
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(active?.model ?? "");
  const [loadingModels, setLoadingModels] = useState(false);
  const [savingActive, setSavingActive] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const prevActiveRef = useRef<ActiveProvider | null>(null);
  const providerSelectId = useId();
  const modelSelectId = useId();

  // Synchronize internal state ONLY when external active prop actually changes or initializes
  useEffect(() => {
    if (
      active &&
      (!prevActiveRef.current ||
        prevActiveRef.current.provider !== active.provider ||
        prevActiveRef.current.model !== active.model)
    ) {
      prevActiveRef.current = active;
      setSelectedProvider(active.provider);
      setSelectedModel(active.model);
    } else if (
      !active &&
      configuredProviders.length > 0 &&
      !configuredProviders.includes(selectedProvider)
    ) {
      setSelectedProvider(configuredProviders[0]);
    }
  }, [active, configuredProviders, selectedProvider]);

  // Load models whenever the selected provider changes
  useEffect(() => {
    let isCancelled = false;
    async function loadModels() {
      const session = getAuthSession();
      if (!session?.accessToken || !configuredProviders.includes(selectedProvider)) {
        setModels([]);
        return;
      }
      setLoadingModels(true);
      try {
        const res = await fetchProviderModels(selectedProvider, session.accessToken);
        if (!isCancelled) {
          setModels(res.models);
          // If selected provider is currently active, preserve active model if available
          if (active?.provider === selectedProvider && res.models.includes(active.model)) {
            setSelectedModel(active.model);
          } else if (res.models.length > 0) {
            setSelectedModel(res.models[0]);
          } else {
            setSelectedModel("");
          }
        }
      } catch {
        if (!isCancelled) {
          setModels([]);
          setSelectedModel("");
        }
      } finally {
        if (!isCancelled) {
          setLoadingModels(false);
        }
      }
    }

    if (configuredProviders.includes(selectedProvider)) {
      void loadModels();
    } else {
      setModels([]);
      setSelectedModel("");
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedProvider, configuredProviders, active?.provider, active?.model]);

  async function handleSetActive(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedModel || !configuredProviders.includes(selectedProvider)) return;

    const session = getAuthSession();
    if (!session?.accessToken) return;

    setSavingActive(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await setActiveProvider(selectedProvider, selectedModel, session.accessToken);
      const newActive = { provider: selectedProvider, model: selectedModel };
      prevActiveRef.current = newActive;
      onActiveChange(newActive);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof LlmProviderApiError
          ? err.message
          : "Failed to update active model.",
      );
    } finally {
      setSavingActive(false);
    }
  }

  const activeMeta = active ? getProviderMeta(active.provider) : null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: "var(--surface-low)",
        border: "1px solid rgba(192,193,255,0.18)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Background accent glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-20"
        style={{ background: activeMeta?.color ?? "var(--primary)" }}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "var(--surface-container)",
                color: "var(--primary)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className="font-bold text-base tracking-tight"
                  style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                >
                  Active LLM Engine
                </h3>
                {active && (
                  <span
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{
                      background: "rgba(34, 197, 94, 0.12)",
                      color: "#4ade80",
                      border: "1px solid rgba(34, 197, 94, 0.25)",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                )}
              </div>
              <p
                className="mt-0.5 text-xs"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
              >
                The active model processes snippet evaluations and automated GitHub pull request reviews.
              </p>
            </div>
          </div>

          {/* Current Active Badge Display */}
          {active ? (
            <div
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 self-start md:self-auto"
              style={{
                background: "var(--surface-container)",
                border: "1px solid rgba(192,193,255,0.2)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: activeMeta?.color ?? "var(--primary)" }}
              />
              <div className="flex flex-col">
                <span
                  className="text-[10px] uppercase font-bold tracking-wider"
                  style={{ color: activeMeta?.color ?? "var(--primary)", fontFamily: "var(--font-space-grotesk)" }}
                >
                  {activeMeta?.name ?? active.provider}
                </span>
                <span
                  className="text-xs font-mono font-medium max-w-[220px] truncate"
                  style={{ color: "var(--on-surface)" }}
                  title={active.model}
                >
                  {active.model}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs self-start md:self-auto"
              style={{
                background: "rgba(255,180,171,0.08)",
                color: "var(--error)",
                border: "1px solid rgba(255,180,171,0.2)",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              <AlertTriangle size={14} />
              <span>No Active Model Set</span>
            </div>
          )}
        </div>

        {/* Change Active Model Form */}
        {configuredProviders.length === 0 ? (
          <div
            className="flex items-center gap-3 rounded-xl p-4 text-xs"
            style={{
              background: "var(--surface-container)",
              border: "1px dashed var(--outline-variant)",
              color: "var(--on-surface-variant)",
              fontFamily: "var(--font-inter)",
            }}
          >
            <Key size={16} style={{ color: "var(--primary)" }} className="shrink-0" />
            <span>
              You haven&apos;t added any API keys yet. Configure at least one provider below to select an active model.
            </span>
          </div>
        ) : (
          <form
            onSubmit={(e) => void handleSetActive(e)}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-2"
            style={{ borderTop: "1px solid rgba(70,69,84,0.2)" }}
          >
            {/* Provider selection */}
            <div className="sm:col-span-4 flex flex-col gap-1.5">
              <label
                htmlFor={providerSelectId}
                className="text-xs font-semibold"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                Provider
              </label>
              <select
                id={providerSelectId}
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as LlmProvider)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors cursor-pointer"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                  color: "var(--on-surface)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {configuredProviders.map((p) => {
                  const m = getProviderMeta(p);
                  return (
                    <option key={p} value={p}>
                      {m.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Model selection */}
            <div className="sm:col-span-5 flex flex-col gap-1.5">
              <label
                htmlFor={modelSelectId}
                className="text-xs font-semibold flex items-center justify-between"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                <span>Model Engine</span>
                {models.length > 0 && (
                  <span className="text-[11px] font-normal" style={{ color: "var(--outline)" }}>
                    {models.length} available
                  </span>
                )}
              </label>
              {loadingModels ? (
                <div
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                    color: "var(--on-surface-variant)",
                  }}
                >
                  <Loader2 size={15} className="animate-spin" style={{ color: "var(--primary)" }} />
                  <span className="text-xs">Fetching provider models…</span>
                </div>
              ) : models.length > 0 ? (
                <select
                  id={modelSelectId}
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm font-mono outline-none transition-colors cursor-pointer"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                    color: "var(--on-surface)",
                    fontSize: "0.85rem",
                  }}
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="flex items-center rounded-xl px-3.5 py-2.5 text-xs"
                  style={{
                    background: "var(--surface-container)",
                    border: "1px solid var(--outline-variant)",
                    color: "var(--outline)",
                  }}
                >
                  No models available for this provider.
                </div>
              )}
            </div>

            {/* Set Active Button */}
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={savingActive || !selectedModel || loadingModels}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                style={{
                  background: saveSuccess ? "var(--surface-container)" : "var(--gradient-cta)",
                  color: saveSuccess ? "#4ade80" : "#ffffff",
                  border: saveSuccess ? "1px solid rgba(34, 197, 94, 0.3)" : "none",
                  fontFamily: "var(--font-space-grotesk)",
                }}
              >
                {savingActive ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saveSuccess ? (
                  <Check size={16} />
                ) : (
                  <ArrowRight size={16} />
                )}
                <span>
                  {savingActive ? "Updating…" : saveSuccess ? "Active Updated!" : "Set as Active"}
                </span>
              </button>
            </div>
          </form>
        )}

        {saveError && (
          <div
            className="flex items-center gap-2 rounded-xl p-3 text-xs"
            style={{
              background: "rgba(255,180,171,0.08)",
              color: "var(--error)",
              border: "1px solid rgba(255,180,171,0.2)",
              fontFamily: "var(--font-inter)",
            }}
          >
            <AlertTriangle size={14} className="shrink-0" />
            <span>{saveError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Add Provider Dialog Modal
// ─────────────────────────────────────────────────────────────────

function AddProviderModal({
  open,
  onClose,
  configuredKeys,
  onKeySaved,
}: {
  open: boolean;
  onClose: () => void;
  configuredKeys: LlmProviderKey[];
  onKeySaved: (key: LlmProviderKey, models: string[]) => void;
}) {
  const configuredProviderIds = configuredKeys.map((k) => k.provider.toUpperCase());

  // Default to first unconfigured provider or NVIDIA
  const defaultProvider =
    KNOWN_PROVIDERS.find((p) => !configuredProviderIds.includes(p.id))?.id ?? "NVIDIA";

  const [selectedProviderId, setSelectedProviderId] = useState<string>(defaultProvider);
  const [customProviderName, setCustomProviderName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [showKeyText, setShowKeyText] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isCustom = selectedProviderId === "CUSTOM";
  const effectiveProviderId = isCustom ? customProviderName.trim().toUpperCase() : selectedProviderId;
  const currentMeta = isCustom
    ? getProviderMeta(customProviderName || "Custom")
    : getProviderMeta(selectedProviderId);

  // Update default provider when modal opens
  useEffect(() => {
    if (open) {
      const firstAvailable =
        KNOWN_PROVIDERS.find((p) => !configuredProviderIds.includes(p.id))?.id ?? "NVIDIA";
      setSelectedProviderId(firstAvailable);
      setCustomProviderName("");
      setApiKey("");
      setBaseUrl("");
      setSaveError(null);
    }
  }, [open, configuredProviderIds.join(",")]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveProviderId || !apiKey.trim()) return;

    const session = getAuthSession();
    if (!session?.accessToken) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await saveProviderKey(
        effectiveProviderId,
        apiKey.trim(),
        baseUrl.trim() || undefined,
        session.accessToken,
      );

      const createdKey: LlmProviderKey = {
        provider: effectiveProviderId,
        maskedKey: res.maskedKey,
        updatedAt: new Date().toISOString(),
        baseUrl: baseUrl.trim() ? baseUrl.trim() : null,
      };

      onKeySaved(createdKey, res.models);
    } catch (err) {
      setSaveError(
        err instanceof LlmProviderApiError
          ? err.message
          : "Failed to connect provider. Please check your credentials.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-2xl outline-none"
        style={{
          background: "var(--surface-high)",
          border: "1px solid rgba(144,143,160,0.24)",
          boxShadow: "var(--shadow-float)",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: currentMeta.bgColor,
                color: currentMeta.color,
              }}
            >
              <currentMeta.icon size={20} />
            </div>
            <div>
              <h3
                className="text-lg font-bold tracking-tight"
                style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
              >
                Add Model Provider
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
              >
                Select a provider and enter your API credentials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          {/* Provider selector options */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              Select Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {KNOWN_PROVIDERS.map((p) => {
                const isSelected = selectedProviderId === p.id;
                const isAlreadyConfigured = configuredProviderIds.includes(p.id);
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProviderId(p.id);
                      setSaveError(null);
                    }}
                    className="flex items-center gap-2 rounded-xl p-2.5 text-left transition-all relative overflow-hidden cursor-pointer"
                    style={{
                      background: isSelected ? p.bgColor : "var(--surface-container)",
                      border: isSelected
                        ? `1px solid ${p.borderColor}`
                        : "1px solid var(--outline-variant)",
                      color: isSelected ? "var(--on-surface)" : "var(--on-surface-variant)",
                    }}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs"
                      style={{ background: `${p.color}20`, color: p.color }}
                    >
                      <Icon size={14} />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                      >
                        {p.name}
                      </span>
                      {isAlreadyConfigured && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <Check size={10} /> Active
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Custom Provider Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProviderId("CUSTOM");
                  setSaveError(null);
                }}
                className="flex items-center gap-2 rounded-xl p-2.5 text-left transition-all cursor-pointer"
                style={{
                  background: isCustom ? "rgba(192,193,255,0.12)" : "var(--surface-container)",
                  border: isCustom
                    ? "1px solid var(--primary)"
                    : "1px solid var(--outline-variant)",
                  color: isCustom ? "var(--primary)" : "var(--on-surface-variant)",
                }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs"
                  style={{ background: "rgba(192,193,255,0.15)", color: "var(--primary)" }}
                >
                  <Server size={14} />
                </span>
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    Custom…
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--outline)" }}>
                    Self-hosted
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Provider Name Input */}
          {isCustom && (
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                Provider Name Identifier
              </label>
              <input
                type="text"
                placeholder="e.g. OLLAMA, VLLM, TOGETHER, MISTRAL"
                value={customProviderName}
                onChange={(e) => setCustomProviderName(e.target.value)}
                required
                autoCapitalize="characters"
                className="w-full rounded-xl px-3 py-2 text-xs font-mono outline-none uppercase transition-colors"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                  color: "var(--on-surface)",
                }}
              />
            </div>
          )}

          {/* API Key Input */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                className="text-xs font-semibold"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                API Key
              </label>
              {currentMeta.docUrl && (
                <a
                  href={currentMeta.docUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 text-[11px] hover:underline"
                  style={{ color: currentMeta.color, fontFamily: "var(--font-space-grotesk)" }}
                >
                  <span>Get {currentMeta.name} Key</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type={showKeyText ? "text" : "password"}
                placeholder="Paste your API key here…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                autoComplete="off"
                className="w-full rounded-xl pl-3 pr-9 py-2.5 text-xs font-mono outline-none transition-colors"
                style={{
                  background: "var(--surface-container)",
                  border: "1px solid var(--outline-variant)",
                  color: "var(--on-surface)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowKeyText((p) => !p)}
                className="absolute right-3 text-stone-400 hover:text-stone-200 cursor-pointer"
                title={showKeyText ? "Hide key" : "Show key"}
              >
                {showKeyText ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Base URL Input */}
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-semibold"
              style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
            >
              Base URL <span style={{ color: "var(--outline)" }}>(Optional / Custom Endpoints)</span>
            </label>
            <input
              type="url"
              placeholder={
                selectedProviderId === "NVIDIA"
                  ? "https://integrate.api.nvidia.com/v1"
                  : "https://api.example.com/v1"
              }
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-xs font-mono outline-none transition-colors"
              style={{
                background: "var(--surface-container)",
                border: "1px solid var(--outline-variant)",
                color: "var(--on-surface)",
              }}
            />
          </div>

          {saveError && (
            <div
              className="flex items-center gap-1.5 rounded-xl p-3 text-xs"
              style={{
                background: "rgba(255,180,171,0.1)",
                color: "var(--error)",
                border: "1px solid rgba(255,180,171,0.2)",
                fontFamily: "var(--font-inter)",
              }}
            >
              <AlertTriangle size={14} className="shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer"
              style={{
                background: "var(--surface-container)",
                color: "var(--on-surface-variant)",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !apiKey.trim() || (isCustom && !customProviderName.trim())}
              className="flex items-center justify-center gap-2 rounded-xl py-2 px-5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{
                background: "var(--gradient-cta)",
                color: "#ffffff",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{saving ? "Validating & Saving…" : "Save Provider"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Provider Card Component
// ─────────────────────────────────────────────────────────────────

function ProviderCard({
  meta,
  existingKey,
  isActiveProvider,
  activeModel,
  onKeySaved,
  onKeyDeleted,
  onSelectAsActive,
}: {
  meta: ProviderMeta;
  existingKey: LlmProviderKey;
  isActiveProvider: boolean;
  activeModel: string | null;
  onKeySaved: (key: LlmProviderKey, models: string[]) => void;
  onKeyDeleted: (provider: LlmProvider) => void;
  onSelectAsActive: (provider: LlmProvider, model: string) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [showKeyText, setShowKeyText] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(existingKey.baseUrl ?? existingKey.nvidiaBaseUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Deletion states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Models catalog states
  const [models, setModels] = useState<string[]>([]);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelSearch, setModelSearch] = useState("");
  const [settingModel, setSettingModel] = useState<string | null>(null);

  const inputKeyId = useId();
  const inputBaseUrlId = useId();

  const IconComponent = meta.icon;

  async function handleSaveKey(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;

    const session = getAuthSession();
    if (!session?.accessToken) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await saveProviderKey(
        meta.id,
        apiKey.trim(),
        baseUrl.trim() || undefined,
        session.accessToken,
      );

      const updatedKey: LlmProviderKey = {
        provider: meta.id,
        maskedKey: res.maskedKey,
        updatedAt: new Date().toISOString(),
        baseUrl: baseUrl.trim() ? baseUrl.trim() : null,
      };

      setModels(res.models);
      setApiKey("");
      setFormOpen(false);
      onKeySaved(updatedKey, res.models);
    } catch (err) {
      setSaveError(
        err instanceof LlmProviderApiError
          ? err.message
          : "Failed to save API key. Please check your inputs.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteKey() {
    const session = getAuthSession();
    if (!session?.accessToken) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteProviderKey(meta.id, session.accessToken);
      setDeleteDialogOpen(false);
      onKeyDeleted(meta.id);
    } catch (err) {
      setDeleteError(
        err instanceof LlmProviderApiError
          ? err.message
          : "Failed to delete API key.",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleLoadModels() {
    const session = getAuthSession();
    if (!session?.accessToken) return;

    setLoadingModels(true);
    setModelsError(null);
    try {
      const res = await fetchProviderModels(meta.id, session.accessToken);
      setModels(res.models);
      setModelsOpen(true);
    } catch (err) {
      setModelsError(
        err instanceof LlmProviderApiError
          ? err.message
          : "Could not fetch models for this key.",
      );
    } finally {
      setLoadingModels(false);
    }
  }

  async function handleQuickSetActive(modelName: string) {
    const session = getAuthSession();
    if (!session?.accessToken) return;

    setSettingModel(modelName);
    try {
      await setActiveProvider(meta.id, modelName, session.accessToken);
      onSelectAsActive(meta.id, modelName);
    } catch (err) {
      setModelsError(
        err instanceof LlmProviderApiError
          ? err.message
          : "Failed to switch active model.",
      );
    } finally {
      setSettingModel(null);
    }
  }

  const filteredModels = models.filter((m) =>
    m.toLowerCase().includes(modelSearch.toLowerCase()),
  );

  return (
    <div
      className="flex flex-col justify-between rounded-2xl p-5 transition-all duration-200"
      style={{
        background: "var(--surface-low)",
        border: isActiveProvider
          ? `1px solid ${meta.borderColor}`
          : "1px solid rgba(70,69,84,0.3)",
        boxShadow: isActiveProvider ? `0 0 20px -5px ${meta.bgColor}` : "none",
      }}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: meta.bgColor, color: meta.color }}
            >
              <IconComponent size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4
                  className="font-bold text-sm"
                  style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                >
                  {meta.name}
                </h4>
                {isActiveProvider && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: meta.bgColor,
                      color: meta.color,
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
              <span
                className="text-[11px]"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
              >
                {meta.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {meta.docUrl && (
              <a
                href={meta.docUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-[11px] transition-opacity hover:opacity-80"
                style={{ color: "var(--outline)", fontFamily: "var(--font-space-grotesk)" }}
                title={`Get API Key from ${meta.name} portal`}
              >
                <span>Portal</span>
                <ExternalLink size={11} />
              </a>
            )}

            {/* Delete Key Dialog Trigger */}
            <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialog.Trigger asChild>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
                  title={`Delete ${meta.name} API Key`}
                  aria-label={`Delete ${meta.name} API Key`}
                >
                  <Trash2 size={14} />
                </button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-150 data-[state=closed]:opacity-0 data-[state=open]:opacity-100" />
                <AlertDialog.Content
                  className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl outline-none transition-all duration-150 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100"
                  style={{
                    background: "var(--surface-high)",
                    border: "1px solid rgba(144,143,160,0.24)",
                    boxShadow: "var(--shadow-float)",
                  }}
                >
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(255,180,171,0.12)", color: "var(--error)" }}
                    aria-hidden="true"
                  >
                    <Trash2 size={20} />
                  </div>
                  <AlertDialog.Title
                    className="text-lg font-bold tracking-tight"
                    style={{ color: "var(--on-surface)", fontFamily: "var(--font-geist-sans)" }}
                  >
                    Remove {meta.name} Key?
                  </AlertDialog.Title>
                  <AlertDialog.Description
                    className="mt-2 text-xs leading-5"
                    style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
                  >
                    This will delete your stored credential for {meta.name}. CodeLens will no longer be able to execute evaluations with this provider until re-added.
                  </AlertDialog.Description>

                  {deleteError && (
                    <p className="mt-3 text-xs text-red-400">{deleteError}</p>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <AlertDialog.Cancel asChild>
                      <button
                        type="button"
                        disabled={deleting}
                        className="rounded-xl px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer"
                        style={{
                          background: "var(--surface-container)",
                          color: "var(--on-surface)",
                          fontFamily: "var(--font-space-grotesk)",
                        }}
                      >
                        Keep Key
                      </button>
                    </AlertDialog.Cancel>
                    <button
                      type="button"
                      onClick={() => void handleDeleteKey()}
                      disabled={deleting}
                      className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      style={{
                        background: "var(--error-container)",
                        color: "var(--error)",
                        fontFamily: "var(--font-space-grotesk)",
                      }}
                    >
                      {deleting ? <Loader2 size={13} className="animate-spin" /> : null}
                      <span>{deleting ? "Deleting…" : "Delete Key"}</span>
                    </button>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </div>
        </div>

        {/* Description */}
        <p
          className="text-xs mb-4 leading-relaxed"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
        >
          {meta.description}
        </p>

        {/* Key Status Pill */}
        <div
          className="flex flex-col gap-1.5 rounded-xl p-3 mb-4"
          style={{ background: "var(--surface-container)" }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--outline)", fontFamily: "var(--font-space-grotesk)" }}
            >
              API Key Status
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <Check size={12} /> Configured
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span
              className="text-xs font-mono font-medium tracking-wide"
              style={{ color: "var(--on-surface)" }}
            >
              {existingKey.maskedKey}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--outline)" }}
            >
              {new Date(existingKey.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {(existingKey.baseUrl || existingKey.nvidiaBaseUrl) && (
            <div
              className="flex items-center gap-1 text-[11px] font-mono mt-1 pt-1.5 border-t truncate"
              style={{ borderColor: "rgba(70,69,84,0.2)", color: "var(--on-surface-variant)" }}
            >
              <Server size={11} className="shrink-0" />
              <span className="truncate">{existingKey.baseUrl ?? existingKey.nvidiaBaseUrl}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons & Form Area */}
      <div className="flex flex-col gap-3">
        {/* Toggle Form Button */}
        <button
          type="button"
          onClick={() => {
            setFormOpen((prev) => !prev);
            setSaveError(null);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all hover:opacity-90 cursor-pointer"
          style={{
            background: "var(--surface-container)",
            border: formOpen ? "1px solid var(--primary)" : "1px solid var(--outline-variant)",
            color: formOpen ? "var(--primary)" : "var(--on-surface)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          <Key size={13} />
          <span>{formOpen ? "Cancel Edit" : "Update Key"}</span>
          {formOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Edit Key Form */}
        {formOpen && (
          <form
            onSubmit={(e) => void handleSaveKey(e)}
            className="flex flex-col gap-3 rounded-xl p-3.5"
            style={{
              background: "var(--surface-container)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor={inputKeyId}
                className="text-[11px] font-semibold"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                New API Key
              </label>
              <div className="relative flex items-center">
                <input
                  id={inputKeyId}
                  type={showKeyText ? "text" : "password"}
                  placeholder="Enter new key to overwrite…"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full rounded-lg pl-3 pr-9 py-2 text-xs font-mono outline-none transition-colors"
                  style={{
                    background: "var(--surface-low)",
                    border: "1px solid var(--outline-variant)",
                    color: "var(--on-surface)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText((p) => !p)}
                  className="absolute right-2.5 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                  title={showKeyText ? "Hide key" : "Show key"}
                >
                  {showKeyText ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor={inputBaseUrlId}
                className="text-[11px] font-semibold"
                style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
              >
                Base URL <span style={{ color: "var(--outline)" }}>(Optional)</span>
              </label>
              <input
                id={inputBaseUrlId}
                type="url"
                placeholder={
                  meta.id === "NVIDIA"
                    ? "https://integrate.api.nvidia.com/v1"
                    : "https://api.example.com/v1"
                }
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs font-mono outline-none transition-colors"
                style={{
                  background: "var(--surface-low)",
                  border: "1px solid var(--outline-variant)",
                  color: "var(--on-surface)",
                }}
              />
            </div>

            {saveError && (
              <div
                className="flex items-center gap-1.5 rounded-lg p-2 text-[11px]"
                style={{
                  background: "rgba(255,180,171,0.1)",
                  color: "var(--error)",
                  border: "1px solid rgba(255,180,171,0.2)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <AlertTriangle size={13} className="shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !apiKey.trim()}
              className="flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{
                background: "var(--gradient-cta)",
                color: "#ffffff",
                fontFamily: "var(--font-space-grotesk)",
              }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>{saving ? "Validating & Saving…" : "Save New Key"}</span>
            </button>
          </form>
        )}

        {/* Models Catalog Expander */}
        <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "rgba(70,69,84,0.2)" }}>
          <button
            type="button"
            onClick={() => {
              if (!modelsOpen && models.length === 0) {
                void handleLoadModels();
              } else {
                setModelsOpen((p) => !p);
              }
            }}
            disabled={loadingModels}
            className="flex items-center justify-between text-xs transition-opacity hover:opacity-80 py-1 cursor-pointer"
            style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Layers size={13} style={{ color: meta.color }} />
              {models.length > 0
                ? `${models.length} Available Models`
                : "Explore Available Models"}
            </span>
            {loadingModels ? (
              <Loader2 size={12} className="animate-spin" />
            ) : modelsOpen ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </button>

          {modelsError && (
            <p className="text-[11px]" style={{ color: "var(--error)" }}>
              {modelsError}
            </p>
          )}

          {modelsOpen && models.length > 0 && (
            <div
              className="flex flex-col gap-2 rounded-xl p-3 max-h-52 overflow-hidden"
              style={{ background: "var(--surface-container)" }}
            >
              {models.length > 5 && (
                <input
                  type="text"
                  placeholder="Search models…"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  style={{
                    background: "var(--surface-low)",
                    border: "1px solid var(--outline-variant)",
                    color: "var(--on-surface)",
                    fontFamily: "var(--font-inter)",
                  }}
                />
              )}

              <div className="flex flex-col gap-1 overflow-y-auto pr-1">
                {filteredModels.map((modelName) => {
                  const isCurrent = isActiveProvider && activeModel === modelName;
                  return (
                    <div
                      key={modelName}
                      className="flex items-center justify-between gap-2 rounded-lg p-1.5 transition-colors"
                      style={{
                        background: isCurrent ? meta.bgColor : "transparent",
                      }}
                    >
                      <span
                        className="text-[11px] font-mono truncate"
                        style={{
                          color: isCurrent ? meta.color : "var(--on-surface-variant)",
                          fontWeight: isCurrent ? "600" : "400",
                        }}
                        title={modelName}
                      >
                        {modelName}
                      </span>

                      {isCurrent ? (
                        <span
                          className="flex shrink-0 items-center gap-1 text-[10px] font-semibold"
                          style={{ color: meta.color }}
                        >
                          <Check size={11} /> Current
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleQuickSetActive(modelName)}
                          disabled={settingModel === modelName}
                          className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50 cursor-pointer"
                          style={{
                            background: "var(--surface-low)",
                            color: "var(--primary)",
                            border: "1px solid var(--outline-variant)",
                          }}
                          title="Set as active model"
                        >
                          {settingModel === modelName ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : null}
                          Use
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton Loading Placeholder
// ─────────────────────────────────────────────────────────────────

function ByokSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Active bar placeholder */}
      <div
        className="h-44 rounded-2xl"
        style={{ background: "var(--surface-low)" }}
      />

      {/* Grid placeholder */}
      <div className="flex flex-col gap-4">
        <div
          className="h-6 w-48 rounded-lg"
          style={{ background: "var(--surface-low)" }}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="h-72 rounded-2xl"
              style={{ background: "var(--surface-low)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Error Banner Component
// ─────────────────────────────────────────────────────────────────

function FetchErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-5"
      style={{
        background: "rgba(255,180,171,0.08)",
        border: "1px solid rgba(255,180,171,0.2)",
      }}
    >
      <AlertTriangle
        size={20}
        style={{ color: "var(--error)", flexShrink: 0, marginTop: 2 }}
      />
      <div className="flex flex-col gap-2">
        <h3
          className="font-semibold text-sm"
          style={{ color: "var(--error)", fontFamily: "var(--font-geist-sans)" }}
        >
          Unable to load provider configuration
        </h3>
        <p
          className="text-xs"
          style={{ color: "var(--on-surface-variant)", fontFamily: "var(--font-inter)" }}
        >
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="self-start rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer"
          style={{
            background: "var(--surface-low)",
            color: "var(--primary)",
            border: "1px solid var(--outline-variant)",
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
