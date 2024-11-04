add_executable(main main.c)

target_link_libraries(main PRIVATE truss_fem)

add_library(truss_fem truss_fem.cpp new.cpp)

if(${WASM})
    target_link_options(main PUBLIC "-Wl,--no-entry" "-Wl,--allow-undefined" "-Wl,--export-all")
    set(CMAKE_C_FLAGS "-fno-builtin --target=wasm32 --no-standard-libraries -O2")
    set(CMAKE_CXX_FLAGS "-fno-builtin --target=wasm32 --no-standard-libraries -O2 -std=c++20")

# target_compile_options(lib PUBLIC
#     "-fno-builtin" "--target=wasm32" "--no-standard-libraries" "-O2")
    # set(CMAKE_EXE_LINKER_FLAGS "-Wl,--no-entry -Wl,--allow-undefined -Wl,--export-all")

endif()