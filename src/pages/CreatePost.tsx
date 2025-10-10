import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreatePost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const wordCount = title.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddLink = () => {
    if (linkInput.trim() && !links.includes(linkInput.trim())) {
      setLinks([...links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const handleRemoveLink = (linkToRemove: string) => {
    setLinks(links.filter(link => link !== linkToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (wordCount > 50) {
      toast({
        title: "Title too long",
        description: "Title must be 50 words or less",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim() || !body.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title and body",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Post created!",
      description: "Your post has been created successfully",
    });
    
    navigate("/happening");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
            />
            <p className={`text-sm ${wordCount > 50 ? "text-destructive" : "text-muted-foreground"}`}>
              {wordCount} / 50 words
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
              />
              <Button type="button" onClick={handleAddTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Body (Markdown supported) *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post content here. You can use markdown formatting like **bold**, *italic*, [links](url), etc."
              className="min-h-[200px]"
              required
            />
            <p className="text-sm text-muted-foreground">
              Supports markdown: **bold**, *italic*, [link](url), # headings, etc.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <Label htmlFor="links">Attach Links</Label>
            <div className="flex gap-2">
              <Input
                id="links"
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
                placeholder="https://example.com"
              />
              <Button type="button" onClick={handleAddLink}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {links.map((link) => (
                <div key={link} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                  <LinkIcon className="h-4 w-4" />
                  <span className="text-sm flex-1 truncate">{link}</span>
                  <X
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => handleRemoveLink(link)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Attach Images</Label>
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit">Create Post</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/happening")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;
