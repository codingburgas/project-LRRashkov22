using System.Threading.Tasks;
using Personal_Finance_Tracker.Models.CardDto;
using Personal_Finance_Tracker.Data;
using Microsoft.EntityFrameworkCore;
using Personal_Finance_Tracker.Models.Entities;
namespace Personal_Finance_Tracker.Services.CardManage
{
    public interface ICardService
    {
        Task<(Account? card, string error)> CreateCard(CardDto req);

    }
}
