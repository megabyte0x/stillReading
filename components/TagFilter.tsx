"use client";

interface TagFilterProps {
  tags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({ tags, activeTags, onToggle, onClear }: TagFilterProps) {
  return (
    <div className="tag-strip">
      <button
        className={`tag-pill ${activeTags.length === 0 ? "active" : ""}`}
        onClick={onClear}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tag-pill ${activeTags.includes(tag) ? "active" : ""}`}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
