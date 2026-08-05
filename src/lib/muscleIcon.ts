// Ícone e rótulo por grupo muscular (categoria do exercício).
// Usado como fallback quando o exercício ainda não tem ilustração.
export function muscleIcon(category: string | null | undefined): string {
  switch (category) {
    case "push":
      return "💪";
    case "pull":
      return "🔙";
    case "legs":
      return "🦵";
    case "core":
      return "🎯";
    case "cardio":
      return "🏃";
    case "mobility":
      return "🧘";
    default:
      return "🏋️";
  }
}

export function muscleLabel(category: string | null | undefined): string {
  switch (category) {
    case "push":
      return "Empurrar";
    case "pull":
      return "Puxar";
    case "legs":
      return "Pernas";
    case "core":
      return "Core";
    case "cardio":
      return "Cardio";
    case "mobility":
      return "Mobilidade";
    default:
      return "Geral";
  }
}
