#pragma once
#include "cstdint.h"
#include "new.hpp"
#include "memory.hpp"
#include "assert.hpp"

template <typename T>
class Matrix
{
public:
    using InternalType = T;

public:
    Matrix()
        : n_rows_(0),
        n_cols_(0),
        data_(nullptr)
    {
    }
    Matrix(const Matrix& other)
        : n_rows_(other.n_rows_),
        n_cols_(other.n_cols_),
        data_(new T[n_rows_ * n_cols_])
    {
        for (std::size_t i = 0; i < n_rows_ * n_cols_; i++)
        {
            data_[i] = other.data_[i];
        }
    }

    Matrix(std::size_t nrows, std::size_t ncols, const std::initializer_list<T>& data)
        : n_rows_(nrows),
        n_cols_(ncols),
        data_(new T[n_rows_ * n_cols_])
    {
        for (std::size_t i = 0; i < n_rows_ * n_cols_; i++)
        {
            data_[i] = *(data.begin() + i);
        }
    }

    Matrix(std::size_t nrows, std::size_t ncols)
        : n_rows_(nrows),
        n_cols_(ncols),
        data_(new T[n_rows_ * n_cols_])
    {
        ZeroMatrix();
    }

    Matrix(std::size_t nrows, std::size_t ncols, T val)
        : n_rows_(nrows),
        n_cols_(ncols),
        data_(new T[n_rows_ * n_cols_])
    {
        SetMatrix(val);
    }

    Matrix(Matrix&& m)
        : n_rows_(m.n_rows_),
        n_cols_(m.n_cols_),
        data_(m.data_)
    {
        m.n_rows_ = 0;
        m.n_cols_ = 0;
        m.data_ = nullptr;
    }

    Matrix& operator=(const Matrix& rhs)
    {
        if (this == &rhs)
            return *this;

        Matrix cpy{ rhs };

        *this = std::move(cpy);

        return *this;
    }

    Matrix& operator=(Matrix&& rhs)
    {
        if (this == &rhs)
            return *this;

        ClearMemory();

        n_cols_ = rhs.n_cols_;
        n_rows_ = rhs.n_rows_;
        data_ = rhs.data_;

        rhs.n_cols_ = 0;
        rhs.n_rows_ = 0;
        rhs.data_ = nullptr;

        return *this;
    }

    ~Matrix()
    {
        ClearMemory();
    }

    Matrix operator+(const Matrix& rhs) const
    {
        Matrix<T> res{ rhs.n_rows_, rhs.n_cols_ };

        for (std::size_t i = 0; i < rhs.n_cols_ * rhs.n_rows_; i++)
        {
            res.data_[i] = data_[i] + rhs.data_[i];
        }

        return res;
    }

    Matrix operator-(const Matrix& rhs) const
    {
        Matrix<T> res{ rhs.n_rows_, rhs.n_cols_ };

        for (std::size_t i = 0; i < rhs.n_cols_ * rhs.n_rows_; i++)
        {
            res.data_[i] = data_[i] - rhs.data_[i];
        }

        return res;
    }

    Matrix& operator+=(const Matrix& rhs)
    {
        for (std::size_t i = 0; i < rhs.n_cols_ * rhs.n_rows_; i++)
        {
            data_[i] += rhs.data_[i];
        }

        return *this;
    }

    Matrix operator*(const Matrix& rhs) const
    {
        assert(n_cols_ == rhs.n_rows_);

        Matrix<T> res{ n_rows_, rhs.n_cols_ };

        for (std::size_t i = 0; i < n_rows_; i++)
        {
            for (std::size_t j = 0; j < rhs.n_cols_; j++)
            {
                for (std::size_t k = 0; k < n_cols_; k++)
                {
                    res(i, j) += (*this)(i, k) * rhs(k, j);
                }
            }
        }

        return res;
    }

    Matrix& operator*=(T rhs)
    {
        for (std::size_t i = 0; i < n_rows_ * n_cols_; i++)
        {
            data_[i] *= rhs;
        }
        return *this;
    }

    T operator()(std::size_t row, std::size_t col) const
    {
        assert(row < n_rows_ && col < n_cols_);
        return data_[(row * n_cols_) + col];
    }

    T& operator()(std::size_t row, std::size_t col)
    {
        assert(row < n_rows_ && col < n_cols_);
        return data_[(row * n_cols_) + col];
    }

    T operator[](std::size_t i) const
    {
        assert(i < size());
        return data_[i];
    }

    bool operator==(const Matrix& rhs) const
    {
        if (rhs.size() != size())
        {
            return false;
        }
        for (std::size_t i = 0; i < rhs.size(); i++)
        {
            const auto diff = (*this)[i] - rhs[i];
            const auto abs_diff = (diff > 0) ? diff : -diff;
            if (abs_diff > 1e-16)
            {
                return false;
            }
        }

        return true;
    }

    T& operator[](std::size_t i)
    {
        assert(i < size());
        return data_[i];
    }

    std::size_t GetNCols() const
    {
        return n_cols_;
    }

    std::size_t GetNRows() const
    {
        return n_rows_;
    }

    std::size_t size() const
    {
        return n_cols_ * n_rows_;
    }

    T back() const
    {
        return data_[n_cols_ * n_rows_ - 1];
    }

    T front() const
    {
        return data_[0];
    }

public:
    static Matrix zeros(std::size_t nrows, std::size_t ncols)
    {
        return Matrix<T>{nrows, ncols};
    }

    static Matrix identity(std::size_t nrows)
    {
        Matrix<T> res{ nrows, nrows };
        for (std::size_t i = 0; i < nrows; i++)
        {
            res(i, i) = 1;
        }
        return res;
    }

private:
    void ClearMemory()
    {
        n_rows_ = 0;
        n_cols_ = 0;
        delete[] data_;
        data_ = nullptr;
    }

    void ZeroMatrix()
    {
        SetMatrix(0);
    }

    void SetMatrix(T val)
    {
        for (std::size_t i = 0; i < n_cols_ * n_rows_; i++)
        {
            data_[i] = val;
        }
    }

private:
    std::size_t n_rows_;
    std::size_t n_cols_;
    T* data_;
};

using MatrixD = Matrix<double>;
using MatrixF = Matrix<float>;
static constexpr auto a = sizeof(MatrixD);
