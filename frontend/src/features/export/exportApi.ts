export const exportApi = {
  downloadResume: async (planId: 'pro' | 'lifetime') => {
    // Здесь будет логика для загрузки резюме в зависимости от плана
    console.log(`Downloading resume with plan: ${planId}`);
    
    // Имитация API вызова
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, planId });
      }, 1000);
    });
  }
}; 