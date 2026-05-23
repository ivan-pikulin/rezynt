type MetrikaParams = Record<string, string | number | boolean | undefined | null>;

type YmFunction = ((counterId: number, method: string, ...args: unknown[]) => void) & {
  a?: unknown[];
  l?: number;
};

const METRIKA_SCRIPT_ID = 'yandex-metrika-tag';
const METRIKA_SCRIPT_SRC = 'https://mc.yandex.ru/metrika/tag.js';

export const METRIKA_EVENTS = {
  landingCtaClick: 'landing_cta_click',
  landingFormStarted: 'landing_form_started',
  landingFormStepOpened: 'landing_form_step_opened',
  landingFormStepCompleted: 'landing_form_step_completed',
  landingFormSubmitAttempt: 'landing_form_submit_attempt',
  landingFormSubmitSuccess: 'landing_form_submit_success',
  landingFormSubmitError: 'landing_form_submit_error',
  landingUploadStarted: 'landing_upload_started',
  landingUploadSuccess: 'landing_upload_success',
  startFromScratchStarted: 'start_from_scratch_started',
  startResumeUploadStarted: 'start_resume_upload_started',
  startResumeUploadSuccess: 'start_resume_upload_success',
  templateSelected: 'template_selected',
  exportDownloadClick: 'export_download_click',
  paymentButtonClick: 'payment_button_click',
  paymentSuccess: 'payment_success',
  resumeExportSuccess: 'resume_export_success',
} as const;

class YandexMetrikaService {
  private counterId: number | null = null;
  private isInitialized = false;
  private pendingCalls: Array<() => void> = [];

  initialize(counterIdValue: string): void {
    if (this.isInitialized) {
      return;
    }

    const parsedCounterId = Number(counterIdValue);
    if (!Number.isInteger(parsedCounterId) || parsedCounterId <= 0) {
      console.error('Invalid VITE_YANDEX_METRIKA_COUNTER_ID:', counterIdValue);
      return;
    }

    this.counterId = parsedCounterId;
    this.ensureTag();

    try {
      window.ym?.(parsedCounterId, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });
      this.isInitialized = true;
      this.flushPendingCalls();
    } catch (error) {
      console.error('Failed to initialize Yandex Metrika:', error);
    }
  }

  trackPageView(page: string, title?: string): void {
    this.call('hit', page, this.cleanParams({ title }));
  }

  trackEvent(eventName: string, params: MetrikaParams = {}): void {
    this.call('reachGoal', eventName, this.cleanParams(params));
  }

  setUserProperties(properties: MetrikaParams): void {
    this.call('userParams', this.cleanParams(properties));
  }

  trackLogin(method: string): void {
    this.trackEvent('login', { method });
  }

  trackSignUp(method: string): void {
    this.trackEvent('sign_up', { method });
  }

  trackLandingCtaClick(location: string): void {
    this.trackEvent(METRIKA_EVENTS.landingCtaClick, { location, flow: 'landing' });
  }

  trackLandingFormStarted(stepId: string): void {
    this.trackEvent(METRIKA_EVENTS.landingFormStarted, { step_id: stepId, flow: 'landing' });
  }

  trackLandingFormStepOpened(stepId: string, stepIndex: number): void {
    this.trackEvent(METRIKA_EVENTS.landingFormStepOpened, {
      step_id: stepId,
      step_index: stepIndex + 1,
      flow: 'landing',
    });
  }

  trackLandingFormStepCompleted(stepId: string, stepIndex: number): void {
    this.trackEvent(METRIKA_EVENTS.landingFormStepCompleted, {
      step_id: stepId,
      step_index: stepIndex + 1,
      flow: 'landing',
    });
  }

  trackLandingFormSubmitAttempt(params: MetrikaParams): void {
    this.trackEvent(METRIKA_EVENTS.landingFormSubmitAttempt, { ...params, flow: 'landing' });
  }

  trackLandingFormSubmitSuccess(params: MetrikaParams): void {
    this.trackEvent(METRIKA_EVENTS.landingFormSubmitSuccess, { ...params, flow: 'landing' });
  }

  trackLandingFormSubmitError(params: MetrikaParams): void {
    this.trackEvent(METRIKA_EVENTS.landingFormSubmitError, { ...params, flow: 'landing' });
  }

  trackLandingUploadStarted(params: MetrikaParams): void {
    this.trackEvent(METRIKA_EVENTS.landingUploadStarted, { ...params, flow: 'old_landing' });
  }

  trackLandingUploadSuccess(params: MetrikaParams): void {
    this.trackEvent(METRIKA_EVENTS.landingUploadSuccess, { ...params, flow: 'old_landing' });
  }

  trackStartFromScratchStarted(): void {
    this.trackEvent(METRIKA_EVENTS.startFromScratchStarted, { flow: 'app_start' });
  }

  trackStartResumeUploadStarted(params: MetrikaParams): void {
    this.trackEvent(METRIKA_EVENTS.startResumeUploadStarted, { ...params, flow: 'app_start' });
  }

  trackStartResumeUploadSuccess(params: MetrikaParams): void {
    this.trackEvent(METRIKA_EVENTS.startResumeUploadSuccess, { ...params, flow: 'app_start' });
  }

  trackTemplateSelected(templateId: string): void {
    this.trackEvent(METRIKA_EVENTS.templateSelected, { template_id: templateId, flow: 'export' });
  }

  trackExportDownloadClick(params: MetrikaParams): void {
    this.trackEvent(METRIKA_EVENTS.exportDownloadClick, { ...params, flow: 'export' });
  }

  trackPaymentButtonClick(planId: string): void {
    this.trackEvent(METRIKA_EVENTS.paymentButtonClick, { plan_id: planId, flow: 'payment' });
  }

  trackPaymentSuccess(params: MetrikaParams = {}): void {
    this.trackEvent(METRIKA_EVENTS.paymentSuccess, { ...params, flow: 'payment' });
  }

  trackResumeExportSuccess(format: string, params: MetrikaParams = {}): void {
    this.trackEvent(METRIKA_EVENTS.resumeExportSuccess, { ...params, format, flow: 'export' });
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  getCounterId(): number | null {
    return this.counterId;
  }

  private ensureTag(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (!window.ym) {
      const ym = ((...args: unknown[]) => {
        ym.a = ym.a || [];
        ym.a.push(args);
      }) as YmFunction;
      ym.l = Date.now();
      window.ym = ym;
    }

    if (document.getElementById(METRIKA_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = METRIKA_SCRIPT_ID;
    script.async = true;
    script.src = METRIKA_SCRIPT_SRC;
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  }

  private call(method: string, ...args: unknown[]): void {
    const execute = () => {
      if (!this.counterId) {
        return;
      }
      try {
        window.ym?.(this.counterId, method, ...args);
      } catch (error) {
        console.error(`Failed to send Yandex Metrika ${method}:`, error);
      }
    };

    if (!this.counterId) {
      if (this.pendingCalls.length < 100) {
        this.pendingCalls.push(execute);
      }
      return;
    }

    execute();
  }

  private flushPendingCalls(): void {
    const calls = [...this.pendingCalls];
    this.pendingCalls = [];
    calls.forEach((call) => call());
  }

  private cleanParams(params: MetrikaParams): MetrikaParams {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
    );
  }
}

export const yandexMetrikaService = new YandexMetrikaService();
export default yandexMetrikaService;
