"use client"
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
import { role, studentsData } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { LongCourseStudent } from "@/types/admin";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Matric Number",
    accessor: "matric_number",
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

const LongCourseStudentListPage = () => {
  const [students, setStudents] = useState<LongCourseStudent[]>([])

  useEffect(() => {
    const fetchAllStudents = async (): Promise<LongCourseStudent[]> => {
        const { data, error } = await supabase
            .from('long_course_students')
            .select('*');
        
        if (error) {
            console.error("Error fetching students:", error.message);
            return [];
        }
        return data as LongCourseStudent[];
    };

    const loadStudents = async () => {
        const students = await fetchAllStudents();
        setStudents(students);
    };

    loadStudents();
  }, []);
  
  const renderRow = (item: LongCourseStudent) => (
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
      <td className="hidden md:table-cell">{item.matric_number}</td>
      <td className="hidden md:table-cell capitalize">{item.sex}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/long-course/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <>
            <FormModal table="longCoursestudent" type="update" data={item} />
            <FormModal table="longCoursestudent" type="delete" />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Long Course Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* <TableSearch /> */}
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              //   <Image src="/plus.png" alt="" width={14} height={14} />
              // </button>
              <FormModal table="longCoursestudent" type="create"/>
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={students} />
      {students.length === 0 && <p className="text-center text-gray-500 text-sm py-8">No records, yet</p>}
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default LongCourseStudentListPage;
