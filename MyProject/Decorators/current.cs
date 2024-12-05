using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

namespace MyProject.Decorators
{
    public class CurrentUserAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var request = context.HttpContext.Request;
            var authorizationHeader = request.Headers["Authorization"].ToString();

            Console.WriteLine($"Authorization Header: {authorizationHeader}"); // Başlığı kontrol et

            if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var token = authorizationHeader.Split(' ')[1];
            var handler = new JwtSecurityTokenHandler();
            JwtSecurityToken jwtToken;

            try
            {
                jwtToken = handler.ReadJwtToken(token);
            }
            catch
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "nameid");

            if (userIdClaim == null)
            {
                Console.WriteLine("sub claim bulunamadı.");
                context.Result = new UnauthorizedResult();
                return;
            }

            Console.WriteLine($"User ID: {userIdClaim.Value}");
            context.ActionArguments["userId"] = userIdClaim.Value; // userId'yi burada ekliyoruz
            base.OnActionExecuting(context);
        }

    }
}