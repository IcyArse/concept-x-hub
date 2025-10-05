import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Settings } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const mockUser = {
    name: "Alex Rivera",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    bio: "Full-stack developer passionate about building innovative solutions",
    skills: ["React", "TypeScript", "Node.js", "UI/UX", "Python"],
  };

  const mockPosts = [
    {
      id: 1,
      content: "Just launched my new portfolio website! Check it out and let me know what you think.",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      content: "Looking for collaborators on an open-source project focused on accessibility tools.",
      timestamp: "1 day ago",
    },
  ];

  const handleUploadPhoto = () => {
    toast.info("Photo upload (requires backend)");
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback>{mockUser.name[0]}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full"
                onClick={handleUploadPhoto}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{mockUser.name}</h1>
                  <p className="text-muted-foreground mt-1">{mockUser.bio}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {mockUser.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Posts</h2>
          
          {mockPosts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback>{mockUser.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold">{mockUser.name}</p>
                    <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                  </div>
                  <p>{post.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
