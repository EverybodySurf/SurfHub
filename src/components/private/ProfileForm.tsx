"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { updateProfile } from "@/app/private/actions"; // Import the updateProfile action

interface ProfileFormProps {
  user: any; // Replace 'any' with a more specific user type if you have one
  profile: any; // Replace 'any' with a more specific profile type if you have one
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Private Page</CardTitle>
          <CardDescription>Welcome, {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add form action and default value */}
          <form className="space-y-4" action={updateProfile}>
            <div>
              <Label htmlFor="name">Name</Label>
              {/* Use defaultValue to pre-fill the input */}
              <Input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={profile?.name || ""}
              />
            </div>
            <Button type="submit" className="w-full">
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}