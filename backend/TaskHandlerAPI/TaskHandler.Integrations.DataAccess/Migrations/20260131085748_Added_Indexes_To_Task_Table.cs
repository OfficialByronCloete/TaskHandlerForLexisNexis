using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskHandler.Integrations.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class Added_Indexes_To_Task_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "timezone('utc', now())",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            // Ensure the pg_trgm extension is available (safe if already present)
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS pg_trgm;");

            // Create a partial GIN trigram index on the concatenation of Title + Description
            // Partial index reduces index size and matches queries that filter IsDeleted = false
            migrationBuilder.Sql(
                "CREATE INDEX IF NOT EXISTS IX_Tasks_TitleDescription_trgm_partial " +
                "ON \"Tasks\" USING GIN ((coalesce(\"Title\", '') || ' ' || coalesce(\"Description\", '')) gin_trgm_ops) " +
                "WHERE \"IsDeleted\" = false;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS IX_Tasks_TitleDescription_trgm;");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "timezone('utc', now())");
        }
    }
}
