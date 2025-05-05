from django.urls import path
# from .views import DiscussionListCreateAPIView, DiscussionDetailAPIView, ReviewListCreateAPIView, ReviewDetailAPIView

# urlpatterns = [
#     path('discussions/', DiscussionListCreateAPIView.as_view(), name='discussion-list-create'),
#     path('discussions/<int:discussion_id>/', DiscussionDetailAPIView.as_view(), name='discussion-detail'),
#     path('reviews/', ReviewListCreateAPIView.as_view(), name='review-list-create'),
#     path('reviews/<int:review_id>/', ReviewDetailAPIView.as_view(), name='review-detail'),
# ]

from feedback import views

urlpatterns = [
    # List reviews (Public/Admin) or Create review (User)
    path('reviews/', views.ReviewListCreateAPIView.as_view(), name='review-list-create'),

    # Detail view (Public/Owner/Admin Read, Owner Update, Owner/Admin Delete)
    path('reviews/<int:pk>/', views.ReviewDetailAPIView.as_view(), name='review-detail'),

    # Admin action to update status
    path('admin/reviews/<int:pk>/status/', views.AdminReviewUpdateStatusAPIView.as_view(), name='admin-review-update-status'),
]
