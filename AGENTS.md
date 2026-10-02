# Architecture Rules

- Mobile safe areas are owned centrally: global gesture behavior belongs in `src/index.css`, shell insets belong in shared layout components, and overlay insets belong in shared UI primitives, so feature screens inherit consistent wrapper behavior.