"use client";

interface TagFilterProps {
  tags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({ tags, activeTags, onToggle, onClear }: TagFilterProps) {
  return (
    <div className="tag-strip" role="group" aria-label="Filter articles by topic">
      <button
        type="button"
        className={`tag-pill ${activeTags.length === 0 ? "active" : ""}`}
        aria-pressed={activeTags.length === 0}
        onClick={onClear}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          type="button"
          key={tag}
          className={`tag-pill ${activeTags.includes(tag) ? "active" : ""}`}
          aria-pressed={activeTags.includes(tag)}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
