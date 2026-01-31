using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskHandler.Integrations.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Add_IsDeleted_Column_To_Task_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Tasks",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Tasks");
        }
    }
}
