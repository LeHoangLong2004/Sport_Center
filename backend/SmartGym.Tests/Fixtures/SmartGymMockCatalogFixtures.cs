using System;
using System.Collections.Generic;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;

namespace SmartGym.Tests.Fixtures;

public static class SmartGymMockCatalogFixtures
{
    public record ExerciseDefinition(
        string Id,
        string Name,
        string VietnameseName,
        string PrimaryMuscle,
        string SecondaryMuscle,
        string Equipment,
        string Difficulty,
        int EstimatedCaloriesPerHour,
        string Instructions
    );

    public static readonly IReadOnlyList<ExerciseDefinition> ComprehensiveExerciseCatalog = new List<ExerciseDefinition>
    {
        // Chest
        new("ex-ch-01", "Barbell Bench Press", "Đẩy ngực ngang đòn tạ", "Chest", "Triceps", "Barbell & Bench", "Intermediate", 420, "Nằm ngửa trên ghế phẳng, 2 chân chạm sàn, hạ tạ kiểm soát chạm nhẹ ngực dưới rồi đẩy thẳng lên."),
        new("ex-ch-02", "Incline Dumbbell Press", "Đẩy ngực trên với tạ đơn", "Upper Chest", "Front Deltoids", "Dumbbells & Incline Bench", "Intermediate", 400, "Chỉnh ghế dốc 30-45 độ, cầm tạ đơn đẩy hướng lên đỉnh trần, siết chặt ngực trên tại điểm cao nhất."),
        new("ex-ch-03", "Decline Barbell Press", "Đẩy ngực dưới với đòn tạ", "Lower Chest", "Triceps", "Barbell & Decline Bench", "Intermediate", 390, "Nằm ghế dốc xuống, cố định chân, đẩy tạ theo phương thẳng đứng tập trung nhóm cơ ngực dưới."),
        new("ex-ch-04", "Cable Chest Flyes", "Ép ngực với dây cáp", "Chest", "Anterior Deltoid", "Cable Machine", "Beginner", 320, "Đứng giữa 2 trụ cáp, hơi nghiêng người về phía trước, ép hai tay vào giữa như động tác ôm cây."),
        new("ex-ch-05", "Dumbbell Pullover", "Vớt tạ đơn mở rộng lồng ngực", "Chest", "Lats", "Dumbbell & Flat Bench", "Intermediate", 350, "Nằm ngang ghế, cầm tạ đơn bằng 2 tay hạ qua đầu theo đường vòng cung để kéo giãn toàn bộ lồng ngực."),
        new("ex-ch-06", "Push-ups", "Chống đẩy hít đất tiêu chuẩn", "Chest", "Core", "Bodyweight", "Beginner", 380, "Thân người thẳng từ gót chân đến đầu, hạ người chạm sàn rồi đẩy lên dứt khoát."),
        new("ex-ch-07", "Dips for Chest", "Chống xà kép tập ngực", "Lower Chest", "Triceps", "Parallel Bars", "Advanced", 450, "Nghiêng thân trên về phía trước khoảng 30 độ, khuỷu tay mở rộng tự nhiên hạ sâu."),
        new("ex-ch-08", "Pec Deck Machine", "Ép ngực với máy chuyên dụng", "Chest", "Front Delts", "Machine", "Beginner", 280, "Ngồi thẳng lưng, ép 2 cánh tay lại gần nhau giữ 1 giây tại điểm cơ căng tối đa."),

        // Back
        new("ex-bk-01", "Conventional Deadlift", "Kéo tạ Deadlift truyền thống", "Lower Back", "Hamstrings & Glutes", "Barbell", "Advanced", 550, "Đứng chân rộng bằng hông, gập hông giữ lưng thẳng, nắm đòn tạ kéo thẳng đứng bằng lực đạp chân."),
        new("ex-bk-02", "Barbell Bent-Over Row", "Gập người kéo đòn tạ", "Lats", "Rhomboids", "Barbell", "Intermediate", 440, "Gập hông 45 độ, kéo đòn tạ về phía rốn, siết chặt xương bả vai ở điểm cao nhất."),
        new("ex-bk-03", "Wide-Grip Lat Pulldown", "Kéo xô cáp tay cầm rộng", "Lats", "Biceps", "Cable Machine", "Beginner", 360, "Ngồi cố định đùi dưới đệm, kéo thanh đòn xuống sát xương quai xanh, mở rộng lồng ngực."),
        new("ex-bk-04", "Seated Cable Row", "Ngồi kéo cáp ngang", "Middle Back", "Biceps", "Cable Machine", "Beginner", 370, "Ngồi thẳng lưng, chân đạp bàn đạp gối hơi gập, kéo tay cầm về bụng dưới siết lưng giữa."),
        new("ex-bk-05", "Pull-ups", "Hít xà đơn tay sấp", "Lats", "Forearms", "Pull-up Bar", "Intermediate", 460, "Treo người trên xà, dùng lực cơ lưng kéo người lên đến khi cằm vượt qua thanh xà."),
        new("ex-bk-06", "T-Bar Row", "Kéo tạ thanh chữ T", "Middle Back", "Lats", "T-Bar Machine", "Intermediate", 430, "Đứng tấn vững chắc, kéo đòn tạ lên sát ngực dưới, giữ cột sống luôn trung tính."),
        new("ex-bk-07", "Hyperextensions", "Gập lưng duỗi thân trên ghế", "Erector Spinae", "Glutes", "Hyperextension Bench", "Beginner", 290, "Cố định đùi trên đệm, hạ thân trên xuống rồi nâng lên đến vị trí cơ thể thẳng hàng."),

        // Legs
        new("ex-lg-01", "Barbell Back Squat", "Gánh tạ đòn Squat", "Quadriceps", "Glutes", "Barbell & Squat Rack", "Advanced", 520, "Đặt thanh đòn trên cầu vai, hạ mông xuống dưới mức song song rồi đạp mạnh đứng lên."),
        new("ex-lg-02", "Leg Press 45 Degree", "Đạp đùi nghiêng 45 độ", "Quadriceps", "Hamstrings", "Leg Press Machine", "Beginner", 460, "Đặt chân giữa bàn đạp, hạ bàn đạp có kiểm soát gập gối 90 độ rồi đẩy thẳng không khóa khớp."),
        new("ex-lg-03", "Romanian Deadlift", "Deadlift kiểu Romania giãn cơ đùi sau", "Hamstrings", "Glutes", "Barbell or Dumbbells", "Intermediate", 440, "Gối hơi chùng nhẹ, đẩy hông về sau hết cỡ hạ tạ qua gối cho đùi sau căng tối đa rồi siết mông đứng lên."),
        new("ex-lg-04", "Walking Lunges", "Chùng chân bước tới", "Glutes", "Quadriceps", "Dumbbells", "Intermediate", 480, "Bước chân dài về phía trước hạ gối vuông góc 90 độ, luân phiên từng chân tiến lên."),
        new("ex-lg-05", "Leg Extension", "Đá đùi trước trên máy", "Quadriceps", "Knee Tendons", "Leg Extension Machine", "Beginner", 300, "Ngồi áp sát lưng vào ghế, đá chân lên thẳng siết chặt cơ tứ đầu đùi 1 giây."),
        new("ex-lg-06", "Lying Leg Curl", "Móc đùi sau nằm trên máy", "Hamstrings", "Calves", "Hamstring Machine", "Beginner", 310, "Nằm sấp áp sát đệm, dùng đùi sau gập chân kéo đệm về sát mông."),
        new("ex-lg-07", "Standing Calf Raise", "Nhón bắp chuối đứng", "Calves", "Ankles", "Calf Machine", "Beginner", 260, "Đứng trên mũi chân, nâng gót chân lên cao hết biên độ siết bắp chân rồi hạ sâu giãn cơ."),

        // Shoulders
        new("ex-sh-01", "Overhead Barbell Press (OHP)", "Đẩy tạ đòn qua đầu đứng", "Anterior Deltoid", "Triceps", "Barbell", "Advanced", 420, "Đứng thẳng siết mông bụng, đẩy đòn tạ thẳng qua đầu khóa tay an toàn."),
        new("ex-sh-02", "Seated Dumbbell Shoulder Press", "Ngồi đẩy tạ đơn vai", "Shoulders", "Triceps", "Dumbbells", "Beginner", 380, "Ngồi ghế tựa lưng 90 độ, đẩy 2 quả tạ đơn lên đỉnh đầu theo đường vòng cung nhẹ."),
        new("ex-sh-03", "Dumbbell Lateral Raise", "Dang tạ đơn sang ngang tập vai giữa", "Lateral Deltoid", "Traps", "Dumbbells", "Beginner", 300, "Hai tay cầm tạ đơn nhẹ, dang ngang hai bên đến ngang vai giữ khuỷu tay hơi chùng."),
        new("ex-sh-04", "Face Pulls with Rope", "Kéo dây thừng vào mặt tập vai sau", "Rear Deltoid", "Rotator Cuff", "Cable Machine", "Beginner", 290, "Kéo dây cáp ngang tầm mắt, tách hai tay sang hai bên tai để siết trọn vai sau."),
        new("ex-sh-05", "Dumbbell Shrugs", "Nhún vai với tạ đơn", "Trapezius", "Forearms", "Heavy Dumbbells", "Beginner", 310, "Cầm tạ đơn hai bên đùi, nhún vai thẳng đứng lên sát tai giữ 1 giây rồi hạ xuống chậm."),

        // Arms
        new("ex-ar-01", "Barbell Bicep Curl", "Cuốn tay trước đòn tạ thẳng", "Biceps", "Forearms", "Barbell", "Beginner", 300, "Cố định khuỷu tay sát sườn, cuộn thanh đòn lên sát ngực rồi hạ có kiểm soát."),
        new("ex-ar-02", "Incline Dumbbell Curl", "Ngồi ghế nghiêng cuốn tạ đơn", "Biceps Long Head", "Forearms", "Incline Bench", "Intermediate", 290, "Ngồi ghế dốc 45 độ buông thõng tay kéo giãn cơ bắp tay trước tối đa."),
        new("ex-ar-03", "Tricep Rope Pushdown", "Kéo cáp dây thừng tay sau", "Triceps Lateral Head", "Forearms", "Cable Machine", "Beginner", 280, "Đứng hơi cúi, ép khuỷu tay đẩy dây cáp xuống dưới và tách nhẹ hai tay sang hai bên."),
        new("ex-ar-04", "Skull Crushers", "Nằm hạ tạ đòn vào trán", "Triceps Long Head", "Forearms", "EZ-Bar & Bench", "Intermediate", 310, "Nằm trên ghế, gập khuỷu tay hạ thanh EZ về ngang trán rồi dùng lực bắp tay sau đẩy thẳng lên."),

        // Core
        new("ex-cr-01", "Plank", "Tư thế Plank đo sàn giữ tĩnh", "Core & Abs", "Glutes", "Yoga Mat", "Beginner", 240, "Chống cùi chỏ vuông góc, thân người thẳng như một tấm ván, siết cứng bụng và thở đều."),
        new("ex-cr-02", "Hanging Leg Raise", "Treo người đu xà nâng chân", "Lower Abs", "Hip Flexors", "Pull-up Bar", "Intermediate", 350, "Treo người trên xà đơn, siết bụng dưới nâng thẳng chân lên góc 90 độ."),
        new("ex-cr-03", "Abdominal Cable Crunch", "Quỳ gập bụng với dây cáp", "Upper Abs", "Obliques", "Cable Machine", "Intermediate", 310, "Quỳ gối giữ dây cáp sau gáy, cuộn tròn lưng gập khuỷu tay về hướng đầu gối.")
    };

    public static List<Invoice> GenerateMockInvoices(Guid userId, int count = 10)
    {
        var list = new List<Invoice>();
        var methods = new[] { PaymentMethod.QRCode, PaymentMethod.BankTransfer, PaymentMethod.CashAtCounter, PaymentMethod.CreditCard };
        var baseDate = new DateTime(2026, 10, 1, 10, 0, 0, DateTimeKind.Utc);

        for (int i = 0; i < count; i++)
        {
            list.Add(new Invoice
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TotalAmount = 500000 + (i * 150000),
                PaymentMethod = methods[i % methods.Length],
                Status = PaymentStatus.Completed,
                CreatedAt = baseDate.AddDays(i * 2),
                PaidAt = baseDate.AddDays(i * 2).AddMinutes(5)
            });
        }

        return list;
    }
}
