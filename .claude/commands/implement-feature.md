Implement the feature described in docs/FEATURES.md under the heading: $ARGUMENTS

Follow this workflow:

1. Read docs/FEATURES.md and find the feature section matching "$ARGUMENTS"
2. Read the current CLAUDE.md for project patterns and constraints
3. Read the current prisma/schema.prisma to understand existing data model
4. Think hard about what could go wrong and edge cases before writing code
5. Create a plan. Do not write code yet. Show me the plan first.

When I approve the plan:

6. Add any new Prisma models to schema.prisma
7. Run `npx prisma migrate dev --name <descriptive-name>` to create migration
8. Implement API routes in api/
9. Implement UI components in src/
10. Verify the build passes: `npm run build`
11. Commit with a descriptive message: `feat: <what you did>`
12. List the acceptance tests from the spec and explain how to verify each one
