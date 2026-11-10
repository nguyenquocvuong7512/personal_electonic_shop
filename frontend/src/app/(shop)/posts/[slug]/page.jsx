"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../../../services/api";
import "../../../../styles/shop/post-detail.css";

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!slug) return;

        let cancelled = false;

        const fetchPost = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/bai-viet/slug/${encodeURIComponent(slug)}`
                );

                if (!cancelled) {
                    if (response.data?.success) {
                        setPost(response.data.data);
                    } else {
                        setError("Không tìm thấy bài viết.");
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Không thể tải nội dung bài viết."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchPost();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="post-detail-message">
                Đang tải bài viết...
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="post-detail-message">
                <p>{error || "Không tìm thấy bài viết."}</p>
                <Link href="/posts">Quay lại danh sách bài viết</Link>
            </div>
        );
    }

    const imagePath = post.hinhanh;

    const imageUrl = imagePath
        ? imagePath.startsWith("http")
            ? imagePath
            : `http://localhost:8000/storage/${imagePath}`
        : "/placeholder.svg";

    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <main className="post-detail-page">
            <div className="post-detail-container">
                <div className="post-breadcrumb">
                    <Link href="/">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/posts">Bài viết</Link>
                    <span>/</span>
                    <span>{post.tieude}</span>
                </div>

                <article className="post-detail">
                    <div className="post-detail-header">
                        <span className="post-detail-topic">
                            {post.chudebaiviet?.ten || "Chưa phân loại"}
                        </span>

                        <h1>{post.tieude}</h1>

                        <div className="post-detail-meta">
                            <span>
                                <i className="fa-regular fa-calendar"></i>
                                {formatDate(post.ngaydang || post.created_at)}
                            </span>
                        </div>
                    </div>

                    <div className="post-detail-cover">
                        <img
                            src={imageUrl}
                            alt={post.tieude}
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                            }}
                        />
                    </div>

                    <div
                        className="post-detail-content"
                        dangerouslySetInnerHTML={{
                            __html: post.noidung || "",
                        }}
                    />

                    <div className="post-detail-footer">
                        <Link href="/posts">
                            ← Quay lại danh sách bài viết
                        </Link>
                    </div>
                </article>
            </div>
        </main>
    );
}