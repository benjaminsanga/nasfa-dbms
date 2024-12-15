"use client"
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { courseOptions, departmentOptions, role } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { ShortCourseStudent } from "@/types/admin";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student ID",
    accessor: "studentId",
    className: "hidden md:table-cell",
  },
  {
    header: "Sex",
    accessor: "sex",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ShortCourseStudentListPage = () => {
  const [students, setStudents] = useState<ShortCourseStudent[]>([]);
  const [filters, setFilters] = useState({
    year: "",
    quarter: "",
    department: "",
    course: "",
  });
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);

  const filteredDepartments = departmentOptions["short"];

  useEffect(() => {
    const fetchAllStudents = async (): Promise<ShortCourseStudent[]> => {
      const { data, error } = await supabase
        .from("short_course_students")
        .select("*");

      if (error) {
        console.error("Error fetching students:", error.message);
        return [];
      }
      return data as ShortCourseStudent[];
    };

    const loadStudents = async () => {
      const students = await fetchAllStudents();
      setStudents(students);
    };

    loadStudents();
  }, []);

  const applyFilters = () => {
    return students.filter((student) => {
      const matchesYear = filters.year
        ? student.year?.toString().toLowerCase().includes(filters.year.toLowerCase())
        : true;
      const matchesQuarter = filters.quarter
        ? student.quarter?.toLowerCase().includes(filters.quarter.toLowerCase())
        : true;
      const matchesDepartment = filters.department
        ? student.department?.toLowerCase().includes(filters.department.toLowerCase())
        : true;
      const matchesCourse = filters.course
        ? student.course?.toLowerCase().includes(filters.course.toLowerCase())
        : true;
  
      return matchesYear && matchesQuarter && matchesDepartment && matchesCourse;
    });
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "department") {
      setFilteredCourses(courseOptions[value] || []);
    }
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const filteredStudents = applyFilters();

  const renderRow = (item: ShortCourseStudent) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo_url}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.first_name} {item.last_name}</h3>
          <p className="text-xs text-gray-500">{item.course}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.student_id}</td>
      <td className="hidden md:table-cell capitalize">{item.sex}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/short-course/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormModal table="shortCourseStudent" type="update" data={item} />
              <FormModal table="shortCourseStudent" type="delete" />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="hidden md:block text-lg font-semibold">All Short Course Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <input
              type="text"
              name="year"
              placeholder="Year"
              value={filters.year}
              onChange={handleFilterChange}
              className="border p-2 rounded w-[100px] text-sm"
            />
            <select
              onChange={handleFilterChange}
              className="w-[150px] p-2 border border-gray-300 rounded-md text-sm"
              name="quarter"
            >
              <option value="">Quarter</option>
              <option value="First">First</option>
              <option value="Second">Second</option>
              <option value="Third">Third</option>
              <option value="Fourth">Fourth</option>
            </select>
            <select
              onChange={handleFilterChange}
              className="w-[150px] p-2 border border-gray-300 rounded-md text-sm"
              name="department"
            >
              <option value="">Department</option>
              {filteredDepartments?.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              name="course"
              className="w-[150px] p-2 border border-gray-300 rounded-md text-sm"
              onChange={handleFilterChange}
            >
              <option value="">Course</option>
              {filteredCourses?.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <button 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              onClick={() => setFilters({
                year: "",
                quarter: "",
                department: "",
                course: "",
              })}
            >Clear Filters</button>
          </div>
        </div>
      </div>
      <hr/>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={filteredStudents} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ShortCourseStudentListPage;