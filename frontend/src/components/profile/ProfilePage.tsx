import React, { useState, useEffect } from "react";
import {
  User,
  Settings,
  Activity,
  Edit,
  Camera,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import type { UserActivity } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfilePageProps {
  className?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ className }) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    favoriteGenres: [] as string[],
    isPublic: true,
    preferences: {
      emailNotifications: true,
      publicWatchlists: false,
      publicRatings: true,
    },
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || "",
        location: user.location || "",
        favoriteGenres: user.favoriteGenres || [],
        isPublic: user.isPublic,
        preferences: user.preferences,
      });
    }
  }, [user]);

  // Load user activity
  useEffect(() => {
    if (isAuthenticated) {
      loadActivity();
    }
  }, [isAuthenticated]);

  const loadActivity = async () => {
    try {
      const response = await apiService.getMyActivity();
      setActivity(response.data.activity);
    } catch (error) {
      console.error("Error loading activity:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await updateUser({
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        favoriteGenres: formData.favoriteGenres,
        isPublic: formData.isPublic,
        preferences: formData.preferences,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ submit: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || "",
        location: user.location || "",
        favoriteGenres: user.favoriteGenres || [],
        isPublic: user.isPublic,
        preferences: user.preferences,
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePreferenceChange = (preference: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [preference]: value },
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">
          Sign in to view your profile
        </h2>
        <p className="text-gray-600">
          Create an account or sign in to manage your profile and preferences.
        </p>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 rounded-full p-1 h-8 w-8"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          maxLength={50}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          placeholder="e.g., New York, NY"
                          maxLength={100}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleInputChange("bio", e.target.value)
                        }
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                        rows={3}
                      />
                      <div className="text-xs text-gray-500 text-right">
                        {formData.bio.length}/500 characters
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked: boolean) =>
                          handleInputChange("isPublic", checked)
                        }
                      />
                      <Label htmlFor="isPublic" className="text-sm">
                        Make my profile public
                      </Label>
                    </div>

                    {errors.submit && (
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Settings className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        {user.location && (
                          <p className="text-gray-600">{user.location}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={user.isPublic ? "default" : "secondary"}
                          >
                            {user.isPublic
                              ? "Public Profile"
                              : "Private Profile"}
                          </Badge>
                          <Badge variant="outline">
                            Member since {formatDate(user.createdAt)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {user.bio && (
                      <div>
                        <h3 className="font-medium mb-2">About</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {user.bio}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {user.stats.totalFavorites}
                            </div>
                            <div className="text-sm text-gray-600">
                              Favorites
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {user.stats.totalWatchlists}
                            </div>
                            <div className="text-sm text-gray-600">
                              Watchlists
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {user.stats.totalMoviesRated}
                            </div>
                            <div className="text-sm text-gray-600">Ratings</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {user.stats.averageRating.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Avg Rating
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activity ? (
                  <div className="space-y-6">
                    {activity.recentRatings.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Recent Ratings</h3>
                        <div className="space-y-2">
                          {activity.recentRatings.slice(0, 5).map((rating) => (
                            <div
                              key={rating.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                            >
                              <img
                                src={rating.movieData.poster}
                                alt={rating.movieData.title}
                                className="w-8 h-12 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {rating.movieData.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Rated {rating.rating}/5 •{" "}
                                  {formatDate(rating.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activity.recentFavorites.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Recent Favorites</h3>
                        <div className="space-y-2">
                          {activity.recentFavorites
                            .slice(0, 5)
                            .map((favorite) => (
                              <div
                                key={favorite.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                              >
                                <img
                                  src={favorite.movieData.poster}
                                  alt={favorite.movieData.title}
                                  className="w-8 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {favorite.movieData.title}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Added to favorites •{" "}
                                    {formatDate(favorite.addedAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Privacy & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-600">
                          Receive updates about new features and recommendations
                        </p>
                      </div>
                      <Switch
                        checked={formData.preferences.emailNotifications}
                        onCheckedChange={(checked: boolean) =>
                          handlePreferenceChange("emailNotifications", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Public Watchlists</Label>
                        <p className="text-sm text-gray-600">
                          Allow others to view your watchlists
                        </p>
                      </div>
                      <Switch
                        checked={formData.preferences.publicWatchlists}
                        onCheckedChange={(checked: boolean) =>
                          handlePreferenceChange("publicWatchlists", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Public Ratings</Label>
                        <p className="text-sm text-gray-600">
                          Show your ratings and reviews to other users
                        </p>
                      </div>
                      <Switch
                        checked={formData.preferences.publicRatings}
                        onCheckedChange={(checked: boolean) =>
                          handlePreferenceChange("publicRatings", checked)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-600">
                          Receive updates about new features and recommendations
                        </p>
                      </div>
                      <Badge
                        variant={
                          user.preferences.emailNotifications
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.preferences.emailNotifications
                          ? "Enabled"
                          : "Disabled"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Public Watchlists</Label>
                        <p className="text-sm text-gray-600">
                          Allow others to view your watchlists
                        </p>
                      </div>
                      <Badge
                        variant={
                          user.preferences.publicWatchlists
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.preferences.publicWatchlists
                          ? "Public"
                          : "Private"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Public Ratings</Label>
                        <p className="text-sm text-gray-600">
                          Show your ratings and reviews to other users
                        </p>
                      </div>
                      <Badge
                        variant={
                          user.preferences.publicRatings
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.preferences.publicRatings ? "Public" : "Private"}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
