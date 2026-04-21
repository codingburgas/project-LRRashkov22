using Personal_Finance_Tracker.Models.AnalyticsDto;

namespace Personal_Finance_Tracker.Services.Analytics
{
    public interface IAnalyticsService
    {
        Task<List<AnalyticsDto>> GetBudgetByUser(int userId, int month, int year);
        Task<List<AnalyticsDto>> GetTargetByUser(int userId, int month, int year);
        Task ResetMonth(int month, int year, int userId);
    }
}
