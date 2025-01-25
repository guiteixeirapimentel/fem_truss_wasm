#pragma once
#include "cstdint.h"

// #ifdef WASM
template <typename T>
class Vector
{
public:
    Vector()
        : buffer_(nullptr),
          size_(0),
          capacity_(0)
    {
    }
    Vector(const Vector &other)
        : Vector()
    {
        ReAlocForCapacity(other.size_);
        for (std::size_t i = 0; i < other.size_; i++)
        {
            buffer_[i] = other[i];
        }
    }
    Vector(Vector &&other)
        : buffer_(other.buffer_),
          size_(other.size_),
          capacity_(other.capacity_)
    {
        other.buffer_ = nullptr;
        other.size_ = 0;
        other.capacity_ = 0;
    }
    Vector &operator=(const Vector &rhs)
    {
        if (this == &rhs)
            return *this;

        (*this) = Vector{rhs};

        return *this;
    }
    Vector &operator=(Vector &&rhs)
    {
        if (this == &rhs)
            return *this;

        buffer_ = rhs.buffer_;
        size_ = rhs.size_;
        capacity_ = rhs.capacity_;

        rhs.buffer_ = nullptr;
        rhs.size_ = 0;
        rhs.capacity_ = 0;

        return *this;
    }

    ~Vector()
    {
        if (buffer_)
        {
            delete[] buffer_;
            buffer_ = nullptr;
        }
    }

    void PushBack(const T &v)
    {
        const auto old_size = size_;
        ReAlocForCapacity(size_ + 1);

        buffer_[old_size] = v;
        size_++;
    }

    void PopBack()
    {
        buffer_[size_ - 1] = T{};
        size_--;
    }

    const T *begin() const
    {
        return buffer_;
    }

    const T *end() const
    {
        return buffer_ + size_;
    }

    T *begin()
    {
        return buffer_;
    }

    T *end()
    {
        return buffer_ + size_;
    }

    T &operator[](std::size_t i)
    {
        return buffer_[i];
    }

    const T &operator[](std::size_t i) const
    {
        return buffer_[i];
    }

    std::size_t Size() const
    {
        return size_;
    }

    std::size_t Capacity() const
    {
        return capacity_;
    }

private:
    void ReAlocForCapacity(std::size_t capacity)
    {
        if (capacity < capacity_)
        {
            return;
        }

        capacity_ = capacity * 2;

        T *new_buffer = new T[capacity_];

        for (std::size_t i = 0; i < size_; i++)
        {
            new_buffer[i] = buffer_[i];
        }

        if (buffer_)
        {
            delete[] buffer_;
            buffer_ = nullptr;
        }

        buffer_ = new_buffer;
    }

private:
    T *buffer_;
    std::size_t size_;
    std::size_t capacity_;
};
// #else
// #include <vector>
// template <typename T>
// using vector = std::vector<T>;
// #endif
