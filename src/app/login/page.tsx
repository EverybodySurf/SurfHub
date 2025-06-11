import { login, signup, socialLogin } from './actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Choose to log in or sign up below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form className="space-y-4" action={login}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button className="w-full" type="submit">Log In</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="space-y-4" action={signup}>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button className="w-full" type="submit">Sign Up</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <form action={socialLogin}>
              <input type="hidden" name="provider" value="google" />
              <Button variant="outline" className="w-full" type="submit">Google</Button>
            </form>
            <form action={socialLogin}>
              <input type="hidden" name="provider" value="github" />
              <Button variant="outline" className="w-full" type="submit">GitHub</Button>
            </form>
            <form action={socialLogin}>
              <input type="hidden" name="provider" value="facebook" />
              <Button variant="outline" className="w-full" type="submit">Facebook</Button>
            </form>
            <form action={socialLogin}>
              <input type="hidden" name="provider" value="apple" />
              <Button variant="outline" className="w-full" type="submit">Apple</Button>
            </form>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}