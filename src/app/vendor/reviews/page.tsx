"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, total: 0, breakdown: [0, 0, 0, 0, 0] });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/vendor/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(data.stats || { avg: 0, total: 0, breakdown: [0, 0, 0, 0, 0] });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/vendor/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Customer Reviews</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-orange-600">{stats.avg.toFixed(1)}</div>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(stats.avg) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-1">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500 mt-1">Total Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium mb-2">Rating Breakdown</div>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 text-xs mb-1">
                  <span className="w-3">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: stats.total ? `${(stats.breakdown[rating - 1] / stats.total) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="w-6 text-right text-gray-500">{stats.breakdown[rating - 1]}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-orange-600" /></div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          on <span className="font-medium">{review.product?.name}</span> · {new Date(review.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <Badge className={review.rating >= 4 ? "bg-green-100 text-green-800" : review.rating >= 3 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                        {review.rating}/5
                      </Badge>
                    </div>
                    {review.comment && <p className="text-sm text-gray-700 mt-2">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
