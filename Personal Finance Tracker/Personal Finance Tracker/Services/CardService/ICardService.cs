using System.Threading.Tasks;
using Personal_Finance_Tracker.Models.CardDto;
using Personal_Finance_Tracker.Models;
using Personal_Finance_Tracker.Data;
using Microsoft.EntityFrameworkCore;
namespace Personal_Finance_Tracker.Services.CardManage
{
    public interface ICardService
    {
        Task<(Card? card, string error)> CreateCard(CardDto req);

    }
}
